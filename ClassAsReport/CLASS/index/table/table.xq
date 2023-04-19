<?xml version="1.0"?>
<XQUERY><![CDATA[element x 
{ 
    attribute bid {'1D6B0E8D28DF9EF'}, attribute cid {'1D6B35F234F5347'}, 
    let $_cid := oda:last(/SOURCE-INFO/@cid)
    let $_bid := oda:last(/SOURCE-INFO/@bid)
for $a in //PACK/OBJECT group by $a/@oid 
return 
element O
{
attribute p {($a[1]/parent/(@oid , substring-after(@link, 'O:')), $a[1]/@p)[1]}, $a[1]/(@oid, @clr, @ro, $_cid, $_bid, @targetClass), 
    attribute name {$a[1]/(@name)[. != ''][1]}, 
    attribute Owner {$a[1]/(@Owner)[1]}, attribute view {$a[1]/(@view)[1]}, $a[1]/(if (targetClass[1][@link]) then element targetClass{targetClass[1]/@link} else ())
}
}]]></XQUERY>