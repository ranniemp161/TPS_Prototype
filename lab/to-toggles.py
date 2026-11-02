# One off: converts the Bespoke choice steps to the shared toggle row (TJ, 13 Oct 2026).
import re
p='index/build-your-programme.html'
s=open(p,encoding='utf-8',newline='').read()
nl="\r\n" if "\r\n" in s else "\n"
def row(inp, title, sub, sub_id=None, sub_attr='', aside=None, extra=''):
    sid=f' id="{sub_id}"' if sub_id else ''
    a=f'<span class="tg__aside"{aside[0]}>{aside[1]}</span>' if aside else ''
    return f'<label class="tg"{extra}>{inp}<span class="tg__body"><span class="tg__t">{title}</span><span class="tg__s"{sid}{sub_attr}>{sub}</span></span>{a}<span class="tg__sw" aria-hidden="true"></span></label>'
ind='          '
def wrap(label, rows, role='radiogroup', hint='Choose one'):
    return (f'<div class="tgl" role="{role}" aria-label="{label}">'+nl+ind+f'  <p class="tgl__hint" aria-hidden="true">{hint}</p>'+nl
            +nl.join(ind+'  '+r for r in rows)+nl+ind+'</div>')
def conv_dkl(m):
    blk=m.group(0)
    label=re.search(r'aria-label="([^"]+)"',blk).group(1)
    ends=re.findall(r'<label class="dkl__end dkl__end--(a|b)"([^>]*)>(<input[^>]*/>)<span class="dkl__title">([^<]+)</span></label>',blk)
    metas={mm[0]:mm for mm in re.findall(r'<p class="dkl__meta dkl__meta--(a|b)" id="([^"]+)"([^>]*)>([^<]*)</p>',blk)}
    assert len(ends)==2 and len(metas)==2
    return wrap(label,[row(inp,title,metas[side][3],metas[side][1],metas[side][2],extra=extra) for side,extra,inp,title in ends])
s,n1=re.subn(r'<div class="dkl" role="radiogroup".*?<div class="dkl__metas">.*?</div>\s*</div>',conv_dkl,s,flags=re.S); assert n1==3,n1
def conv_dkd(m):
    blk=m.group(0)
    inputs=re.findall(r'<label class="dkd__day"[^>]*>(<input[^>]*/>)<span class="dkd__n">(\d+)</span></label>',blk)
    infos={i[1]:i for i in re.findall(r'<p class="dkd__info" id="([^"]+)" data-for="(\d+)">(.*?)</p>',blk)}
    assert len(inputs)==4
    return wrap('How long',[row(inp,f'{n} days',infos[n][2],infos[n][0]) for inp,n in inputs])
s,n2=re.subn(r'<div class="dkd" role="radiogroup".*?<div class="dkd__infos">.*?</div>\s*</div>',conv_dkd,s,flags=re.S); assert n2==1
s,n3=re.subn(r'<label class="treat">(<input[^>]*/>)<span class="dk-dot" aria-hidden="true"></span><span class="treat__body"><span class="treat__head"><span class="treat__title">([^<]+)</span><span class="treat__count" data-count="([^"]+)">([^<]*)</span></span><span class="treat__what">([^<]*)</span></span></label>',
    lambda m: row(m.group(1),m.group(2),m.group(5),aside=(f' data-count="{m.group(3)}"',m.group(4))),s); assert n3==6,n3
s,n4=re.subn(r'<li class="treat treat--included"><span class="treat__body"><span class="treat__head"><span class="treat__title">([^<]+)</span><span class="treat__tag">Included</span></span><span class="treat__what">([^<]*)</span></span></li>',
    lambda m: f'<li class="tg tg--included"><span class="tg__body"><span class="tg__t">{m.group(1)}</span><span class="tg__s">{m.group(2)}</span></span><span class="tg__aside">Included</span></li>',s); assert n4==2
s=s.replace('<ul class="treats treats--included">','<ul class="tgl tgl--included">')
s,n5=re.subn(r'<div class="treats( treats--more)?">', '<div class="tgl" role="group" aria-label="Recovery treatments">'+nl+'            <p class="tgl__hint" aria-hidden="true">Choose any</p>', s); assert n5==2
old='<div class="rhythms" role="radiogroup" aria-label="Massage rhythm" data-rhythms></div>'; assert s.count(old)==1
s=s.replace(old,'<div class="tgl" role="radiogroup" aria-label="Massage rhythm"><p class="tgl__hint" aria-hidden="true">Choose one</p><div class="tgl__rows" data-rhythms></div></div>')
s,n6=re.subn(r'<label class="prio">(<input[^>]*/>)<span class="dk-dot" aria-hidden="true"></span><span class="prio__body"><span class="prio__title">([^<]+)</span><span class="prio__what">([^<]*)</span></span></label>',
    lambda m: row(m.group(1),m.group(2),m.group(3)),s); assert n6==6
s,n7=re.subn(r'<div class="priorities">','<div class="tgl" role="group" aria-label="What matters most to you">'+nl+'            <p class="tgl__hint" aria-hidden="true">Choose any</p>',s); assert n7==2
open(p,'w',encoding='utf-8',newline='').write(s)
print('ok')
