function getPage() {
  return {
    link: window.location.href,
    icon: window.icon,
    title: window.document.title
  }

}


function printPage() {
  const page = getPage();
  console.log(page);
  // document.getElementById("title").textContent = page.title;
}

setTimeout(function() {console.log("5 seconds")}, 5000);
printPage();


const tab = {
  link: '',
  title: '',
  icon: ''
}

chrome.windows.getLastFocused()
  .then(res => {
    console.log(res.id);
    return chrome.tabs.query({
      windowId: res.id,
      active: true
    })
  })
  .then(res => {
    tab.link = res[0].url;
    tab.title = res[0].title;
    tab.icon = res[0].favIconUrl;
  })



document.getElementById("sample-button").onclick = ((e) => {
  console.log("clicked");
  document.getElementById("title").textContent = tab.title;
})