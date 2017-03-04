function _privateFieldHidingReplacer(key,value)
{
    if (key.startsWith("_")) return undefined;
    else return value;
}

function JSON_stringifyWithoutPrivateFields(obj) {
    return JSON.stringify(obj, _privateFieldHidingReplacer);
}