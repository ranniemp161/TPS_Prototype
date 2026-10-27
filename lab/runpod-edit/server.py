# Image edit job server for the TPS model comparison (Opus, 27 Oct 2026).
# v2: per image prompts (job.prompts), job.only, job.tag on output folders, job.keep_weights.
# Stdlib HTTP so it answers before the heavy stack is installed.
# Every request needs "Authorization: Bearer $API_TOKEN".
import os, json, threading, traceback, time, gc, shutil
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler

TOKEN = os.environ["API_TOKEN"]
W = "/workspace"; IN = f"{W}/in"; OUT = f"{W}/out"; LOG = f"{W}/job.log"
os.makedirs(IN, exist_ok=True); os.makedirs(OUT, exist_ok=True)
os.environ.setdefault("HF_HOME", f"{W}/hf"); os.environ["HF_HUB_ENABLE_HF_TRANSFER"] = "1"
STATE = {"running": False, "done": False, "error": None, "progress": []}

def log(m):
    line = time.strftime("%H:%M:%S ") + m
    print(line, flush=True)
    with open(LOG, "a") as f: f.write(line + "\n")

def run_job(job):
    # v3 (Opus, 27 Oct 2026): job.runs holds several prompt sets run on one model load.
    STATE.update(running=True, done=False, error=None, progress=[])
    try:
        import torch, inspect
        from diffusers import DiffusionPipeline
        from PIL import Image
        names = sorted(f for f in os.listdir(IN) if f.lower().endswith((".png", ".jpg")))
        for m in job["models"]:
            repo = m["repo"]
            log(f"loading {repo}")
            t0 = time.time()
            pipe = DiffusionPipeline.from_pretrained(repo, torch_dtype=torch.bfloat16, token=os.environ.get("HF_TOKEN"))
            pipe.to("cuda")
            pipe.set_progress_bar_config(disable=True)
            params = inspect.signature(pipe.__call__).parameters
            log(f"loaded {type(pipe).__name__} in {time.time()-t0:.0f}s")
            runs = job.get("runs") or [{"key": m["key"] + job.get("tag", ""), "prompts": job.get("prompts", {})}]
            for r in runs:
                rk = r["key"]; os.makedirs(f"{OUT}/{rk}", exist_ok=True)
                for n in names:
                    stem = os.path.splitext(n)[0]
                    if r.get("only") and stem not in r["only"]: continue
                    t1 = time.time()
                    img = Image.open(f"{IN}/{n}").convert("RGB")
                    kw = dict(image=img, prompt=r.get("prompts", {}).get(stem, job.get("prompt")),
                              num_inference_steps=m.get("steps", 40),
                              generator=torch.Generator("cuda").manual_seed(r.get("seed", job.get("seed", 0))))
                    if "true_cfg_scale" in params:
                        kw["true_cfg_scale"] = m.get("cfg", 4.0); kw["negative_prompt"] = " "
                        if "guidance_scale" in params: kw["guidance_scale"] = 1.0
                    else:
                        kw["guidance_scale"] = m.get("cfg", 4.5)
                        if "negative_prompt" in params: kw["negative_prompt"] = ""
                    try:
                        out = pipe(**kw).images[0]
                        out.save(f"{OUT}/{rk}/{stem}.png")
                        STATE["progress"].append(f"{rk}/{n}")
                        log(f"{rk} {n} {out.size} {time.time()-t1:.0f}s")
                    except Exception as e:
                        log(f"{rk} {n} FAILED {e!r}"); log(traceback.format_exc())
            del pipe; gc.collect(); torch.cuda.empty_cache()
            if not job.get("keep_weights"): shutil.rmtree(f"{W}/hf/hub/models--{repo.replace('/', '--')}", ignore_errors=True)
            log(f"finished {repo}")
        STATE["done"] = True
    except Exception as e:
        STATE["error"] = repr(e); log("JOB ERROR " + traceback.format_exc())
    finally:
        STATE["running"] = False

class H(BaseHTTPRequestHandler):
    def _ok(self, code=200, body=b"", ctype="application/json"):
        self.send_response(code); self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body))); self.end_headers(); self.wfile.write(body)
    def _auth(self):
        if self.headers.get("Authorization") != f"Bearer {TOKEN}":
            self._ok(401, b'{"error":"unauthorized"}'); return False
        return True
    def _tail(self, path, n=60):
        try: return "".join(open(path, errors="replace").readlines()[-n:])
        except Exception: return ""
    def do_GET(self):
        if not self._auth(): return
        p = self.path
        if p == "/health":
            free = shutil.disk_usage(W).free // 2**30
            body = dict(ready=os.path.exists(f"{W}/READY"), disk_free_gb=free, **STATE)
            body["progress_count"] = len(STATE["progress"]); body.pop("progress")
            return self._ok(200, json.dumps(body).encode())
        if p == "/bootstrap-log": return self._ok(200, self._tail(f"{W}/bootstrap.log").encode(), "text/plain")
        if p == "/job-log": return self._ok(200, self._tail(LOG, 200).encode(), "text/plain")
        if p == "/list": return self._ok(200, json.dumps(STATE["progress"]).encode())
        if p.startswith("/out/"):
            f = os.path.normpath(f"{OUT}/{p[5:]}")
            if f.startswith(OUT) and os.path.isfile(f):
                return self._ok(200, open(f, "rb").read(), "image/png")
        self._ok(404, b'{"error":"not found"}')
    def do_POST(self):
        if not self._auth(): return
        body = self.rfile.read(int(self.headers.get("Content-Length", 0)))
        if self.path.startswith("/upload/"):
            name = os.path.basename(self.path[8:])
            open(f"{IN}/{name}", "wb").write(body); return self._ok(200, b'{"ok":true}')
        if self.path == "/run":
            if STATE["running"]: return self._ok(409, b'{"error":"busy"}')
            if not os.path.exists(f"{W}/READY"): return self._ok(409, b'{"error":"not ready"}')
            threading.Thread(target=run_job, args=(json.loads(body),), daemon=True).start()
            return self._ok(200, b'{"started":true}')
        self._ok(404, b'{"error":"not found"}')
    def log_message(self, *a): pass

ThreadingHTTPServer(("0.0.0.0", 8000), H).serve_forever()
