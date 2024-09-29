from bs4 import BeautifulSoup
import re
"""
상품 번호는 //*[@id="tp-bought-root"]/div[23]/div/table/tbody[1]/tr/td[1]
트래킹 번호는 //*[@id="list-bought-items"]/div[9]/div/div/div/div[2]/div/div/span[3] 여기 있어.
상품번호만 주어졌을 때 트래킹 번호를 찾는 코드
"""
# Load the HTML content from the uploaded file
with open("test_sample_html.html", "r", encoding="utf-8") as file:
    html_content = file.read()

soup = BeautifulSoup(html_content, "html.parser")
post_dict ={}
list_bought_items = soup.find(id="list-bought-items").find_all("div")

for i, div in enumerate(list_bought_items):
    try:
        prefix = div.find("div").find("div").find("div").find_all("div")[1].find("div")
        post_company = prefix.find("div").find("span").text
        traking_number = prefix.find("div").find_all("span")[2].text
        order_string = prefix.find("ul").find_all("li")[2].find("p").find("span").find("a")["href"]
        match = re.search(r"orderId=(\d+)", order_string)
        # if match:
        order_id = match.group(1)
        post_dict[order_id] = {"post_company": post_company, "traking_number":traking_number}
    except:
        pass