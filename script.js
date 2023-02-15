function getPage() {
  return {
    link: window.location.href,
    icon: window.icon
  }

}


function printPage() {
  console.log(getPage())
}

printPage();

