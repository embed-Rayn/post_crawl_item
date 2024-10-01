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
    setTimeout(() => {
        console.log("2초 대기 후 작업 수행");
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
    }, 2000);
    

    return postDict;
}
function crawling(postCompanyDict){
    const tabaoID = document.querySelector("#J_SiteNavLogin div div a").innerText;
    console.log(tabaoID);
    // tp-bought-root div 찾기
    const rootDiv = document.querySelector("#tp-bought-root");

// 주문 정보를 저장할 배열
    const orderData = [];
    // rootDiv에서 모든 div 탐색
    rootDiv.querySelectorAll('div').forEach((div, div_i) => {
        try {// 주문번호 찾기
            const orderNumber = div.querySelector("table tbody tr td span:nth-of-type(3)").innerText;
            const orderDate = div.querySelector("table tbody tr td label span:nth-of-type(2)").innerText;
            try {
                const postInfo = postCompanyDict[orderNumber];
                const postCompany = postInfo.post_company;
                const trackingNumber = postInfo.tracking_number;
                const optionDetails = div.querySelectorAll("table tbody:nth-of-type(2) tr");

                optionDetails.forEach((optionDetail, opt_idx) => {
                    console.log(opt_idx);
                    let color = "";
                    let size = "";
                    try {
                        
                        const productName = optionDetail.querySelector("td div div:nth-of-type(2) p a span:nth-of-type(2)").innerText;
                        const optionValue = (opt_idx + 1).toString();;
                        try{
                            color = optionDetail.querySelector("td div div:nth-of-type(2) p:nth-of-type(2) span span(3)").innerText;
                        } catch(err){
                            console.log("color 없음");
                        }
                        try{
                            size = optionDetail.querySelector("td div div:nth-of-type(2) p:nth-of-type(2) span:nth-of-type(2) span:nth-of-type(3)").innerText;
                        } catch(err){
                            console.log("size 없음");
                        }
                        const quantityValue = optionDetail.querySelectorAll("td")[2].querySelector("div p").innerText;
                        const priceValue = optionDetail.querySelectorAll("td")[1].querySelector("div p:last-of-type span:nth-of-type(2)").innerText;
                        const imageUrl = optionDetail.querySelector("td div div:nth-of-type(1) a img").getAttribute("src").replace(/_\d+x\d+\.\w+$/, '');;
                        const productUrl = optionDetail.querySelector("td div div:nth-of-type(1) a").getAttribute("href");
                        console.log(orderNumber, orderDate, productName, optionValue, color, size, quantityValue, priceValue, imageUrl, productUrl, postCompany, trackingNumber);
                        // 각 주문 데이터를 저장
                        orderData.push({
                            orderNumber,
                            orderDate,
                            productName,
                            optionValue,
                            color,
                            size,
                            quantityValue,
                            priceValue,
                            imageUrl,
                            productUrl,
                            postCompany,
                            trackingNumber
                        });
                    } 
                    catch (err) {
                        console.log(`Not Found [ETC]: index ${opt_idx}`);
                    }
            });
            } catch (err) {
                console.log(`Not Found [post_info]: index ${div_i}`);
            }
        } catch (err) {
            console.log(`Not Found [order_number]: index ${div_i}`);
        }
    });

    // 크롤링한 주문 데이터를 콘솔에 출력 (또는 저장/전송 가능)
    console.log(orderData);
    return(orderData)
};

// 다른 스크립트와 통신을 위해 메시지 받기
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "getPostCompany") {
        const postCompanyData = getPostCompany();
        sendData = crawling(postCompanyData);
        sendResponse({ data: sendData });
    }
});
