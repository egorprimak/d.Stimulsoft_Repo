<?xml version="1.0"?>
<XQUERY><![CDATA[declare namespace sys='urn:odant:sys';

element x 
{ 
    namespace { 'sys' } { 'urn:odant:sys' },
    attribute bid {'ROOT'}, attribute cid {'1D6B3813E994521'}, 
    let $_cid := oda:last(/SOURCE-INFO/@cid)
    let $_bid := oda:last(/SOURCE-INFO/@bid)
for $a in //PACK/OBJECT group by $a/@oid 
return 
element O
{
attribute p {($a[1]/parent/(@oid , substring-after(@link, 'O:')), $a[1]/@p)[1]}, $a[1]/(@oid, @sys:*, @clr, @ro, $_cid, $_bid, @targetClass, @date, @result, @resultDate, @status, @message, @isNew, @userId, @source, @input, @type, @group, @groupLabel, @groupDate, @format), 
    attribute name {$a[1]/(@name)[. != ''][1]}, 
    attribute Owner {$a[1]/(@Owner)[1]}, attribute view {$a[1]/(@view)[1]}, $a[1]/(if (targetClass[1][@link or @sys:link]) then element targetClass{(targetClass[1]/(@link,@sys:link))} else (), if (date[1][@link or @sys:link]) then element date{(date[1]/(@link,@sys:link))} else (), if (result[1][@link or @sys:link]) then element result{(result[1]/(@link,@sys:link))} else (), if (resultDate[1][@link or @sys:link]) then element resultDate{(resultDate[1]/(@link,@sys:link))} else (), if (status[1][@link or @sys:link]) then element status{(status[1]/(@link,@sys:link))} else (), if (message[1][@link or @sys:link]) then element message{(message[1]/(@link,@sys:link))} else (), if (isNew[1][@link or @sys:link]) then element isNew{(isNew[1]/(@link,@sys:link))} else (), if (userId[1][@link or @sys:link]) then element userId{(userId[1]/(@link,@sys:link))} else (), if (source[1][@link or @sys:link]) then element source{(source[1]/(@link,@sys:link))} else (), if (input[1][@link or @sys:link]) then element input{(input[1]/(@link,@sys:link))} else (), if (type[1][@link or @sys:link]) then element type{(type[1]/(@link,@sys:link))} else (), if (group[1][@link or @sys:link]) then element group{(group[1]/(@link,@sys:link))} else (), if (groupLabel[1][@link or @sys:link]) then element groupLabel{(groupLabel[1]/(@link,@sys:link))} else (), if (groupDate[1][@link or @sys:link]) then element groupDate{(groupDate[1]/(@link,@sys:link))} else (), if (format[1][@link or @sys:link]) then element format{(format[1]/(@link,@sys:link))} else ())
}
}]]></XQUERY>