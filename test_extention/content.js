// content.js: 웹 페이지에서 실행되어 DOM을 읽어오는 스크립트

function getPostCompany() {
    document.querySelectorAll('#viewLogistic').forEach((element) => {
        // 마우스 hover(hover) 이벤트 트리거
        const mouseOverEvent = new MouseEvent('mouseover', {
            bubbles: true,
            cancelable: true,
            view: window
        });
    
        // 각 요소에 mouseover 이벤트 발생
        element.dispatchEvent(mouseOverEvent);
    });
    
    const postDict = {};
    const listBoughtItems = document.querySelectorAll("#list-bought-items div");
    listBoughtItems.forEach((div, i) => {
        try {
            const prefix = div.querySelector("div div div div:nth-of-type(2) div");
            const postCompany = prefix.querySelector("div span").innerText;
            const trackingNumber = prefix.querySelectorAll("div span")[2].innerText;
            const orderString = prefix.querySelector("ul li:nth-of-type(3) p span a").getAttribute("href");
            
            // 정규식을 사용하여 orderId를 추출
            const match = orderString.match(/orderId=(\d+)/);
            if (match) {
                const orderId = match[1];
                postDict[orderId] = { post_company: postCompany, tracking_number: trackingNumber };
            }
        } catch (err) {
            console.log(`Error processing item ${i}:`, err);
        }
    });

    return postDict;
}
function nextButton(){
    const button = document.querySelector("#tp-bought-root > div.row-mod__row___2aREm.js-actions-row-bottom > div:nth-child(2) > ul > li.pagination-next > a");
//*[@id="tp-bought-root"]/div[54]/div[2]/ul/li[6]/a
//*[@id="tp-bought-root"]/div[54]/div[2]/ul/li[5]/ㅁ
    // 버튼 클릭 이벤트를 발생시키는 함수
    function clickButtonAndWait() {
        if (button) {
            // 버튼 클릭
            button.click();
            console.log("Button clicked");

            // 3초 대기 (3000 밀리초)
            setTimeout(() => {
                console.log("3초 대기 후 작업 수행");
                // 여기에서 3초 후에 수행할 작업을 추가하세요.
            }, 3000);
        } else {
            console.log("버튼을 찾을 수 없습니다.");
        }
    }

    // 버튼 클릭 및 대기 함수 실행
    clickButtonAndWait();
}
// 다른 스크립트와 통신을 위해 메시지 받기
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "getPostCompany") {
        const postCompanyData = nextButton();
        sendResponse({ data: postCompanyData });
    }
});
