<?xml version="1.0"?>
<XQUERY><![CDATA[declare namespace sys='urn:odant:sys';

element x 
{ 
    namespace { 'sys' } { 'urn:odant:sys' },
    attribute bid {'ROOT'}, attribute cid {'1D6EE3EE7BFC08A'}, 
    let $_cid := oda:last(/SOURCE-INFO/@cid)
    let $_bid := oda:last(/SOURCE-INFO/@bid)
for $a in //PACK/OBJECT group by $a/@oid 
return 
element O
{
attribute p {($a[1]/parent/(@oid , substring-after(@link, 'O:')), $a[1]/@p)[1]}, $a[1]/(@oid, @sys:*, @clr, @ro, $_cid, $_bid), 
    attribute name {$a[1]/(@name)[. != ''][1]}, 
    attribute Owner {$a[1]/(@Owner)[1]}, attribute view {$a[1]/(@view)[1]}
}
}]]></XQUERY>