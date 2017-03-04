function ArrayUtil() {}

ArrayUtil.arrayToObject = function(arr, propertyNamer) {
    var obj = {};
    for(var i = 0;i < arr.length;i++) {
        obj[propertyNamer(arr[i])] = arr[i];
    }
    return obj;
};