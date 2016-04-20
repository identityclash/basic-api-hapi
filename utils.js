'user strict';

const compareStrings = function strcmp(a, b) {
    a = a.toString(), b = b.toString();
    for (var i=0,n=Math.max(a.length, b.length); i<n && a.charAt(i) === b.charAt(i); ++i);
    if (i === n) return 0;
    return a.charAt(i) > b.charAt(i) ? -1 : 1;
}

module.exports = {
    compareStrings: compareStrings
};