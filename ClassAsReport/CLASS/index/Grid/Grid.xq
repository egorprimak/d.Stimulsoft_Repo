<?xml version="1.0"?>
<XQUERY><![CDATA[element x {
    for $a in //PACK/OBJECT group by $a/@oid 
	return 
    element O
	{
		$a[1]/(@oid, @clr, @ro, @targetClass), 
            attribute name {$a[1]/(@name,(@targetClass))[. != ''][1]}, 
            attribute Owner {$a[1]/(@Owner)[1]}, attribute view {$a[1]/(@view)[1]}
	}
}]]></XQUERY>