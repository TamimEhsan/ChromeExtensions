//alert('grrrrrr.....')
// chrome.runtime.onMessage.addListener(function (request,
// sender,sendResponse){
//     const re = new RegExp('bear','gi')
//     const mathces = document.documentElement.innerHTML.match(re);
//     sendResponse({count:mathces.length});
// })

const re = new RegExp('bear','gi')
const matches = document.documentElement.innerHTML.match(re);

chrome.runtime.sendMessage({
    url:window.location.href,
    count:matches.length
})