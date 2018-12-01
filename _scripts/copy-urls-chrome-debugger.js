UI.panels.network._networkLogView._dataGrid._rootNode._flatNodes.map(n => n._request._url)
.map(str => str.replace('http://localhost:4000', '')).filter(onlyUnique)
.map(str => `"{{ "${str}" | absolute_url }}"`).join(',\n')