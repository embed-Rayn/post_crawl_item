import os
import sys
import time
from PyQt6.QtCore import Qt, QThread, pyqtSignal
from PyQt6.QtWidgets import *
from PyQt6 import QtGui
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import WebDriverException
from selenium.webdriver.chrome.service import Service
from selenium.webdriver import Remote
import pyperclip
from bs4 import BeautifulSoup
import re
import pandas as pd
from datetime import datetime
# from template import Ui_Dialog
import pickle
from PyQt6 import uic


def convert_date(date_str):
    match = re.search(r"(\d{2})月(\d{2})日 (\d{2}:\d{2})", date_str)

    if match:
        month = match.group(1)
        day = match.group(2)
        time = match.group(3)

        # 현재 연도
        year = 2024

        # 날짜를 생성
        delivery_date = datetime(year, int(month), int(day)) 

        # 최종 형식으로 변환
        result = delivery_date.strftime(f"%Y-%m-%d {time}")
        return result


Ui_Dialog = uic.loadUiType("gui.ui")[0]

class WindowClass(QMainWindow, Ui_Dialog):
    def __init__(self):
        super().__init__()
        # loadUi("gui.ui", self)
        self.setupUi(self)
        self.setAcceptDrops(True)
        self.setWindowTitle("Post Items")

        self.setFixedWidth(652)
        self.setFixedHeight(519)

        font1 = QtGui.QFont("Arial", 20)
        font2 = QtGui.QFont("굴림체", 11)
        font3 = QtGui.QFont("Arial", 11)
        self.driver = ""
        h1_list = [self.label_01, self.label_02]
        h2_list = [self.label_status]
        h3_list = [self.label_order_1, self.label_order_2, self.label_order_3, self.label_order_4,
                self.label_order_5, self.label_order_6, self.label_order_7, self.label_order_8,
                self.label_order_9, self.label_order_10, self.label_order_11, self.label_order_12]
        self.cb_list = [self.cb_01, self.cb_02, self.cb_03, self.cb_04, self.cb_05, self.cb_06, 
                        self.cb_07, self.cb_08, self.cb_09, self.cb_10, self.cb_11, self.cb_12]
        
        self.column_path = os.path.join(os.path.abspath("."), "pkl_col.pkl")
        with open(self.column_path, 'rb') as file:
            self.excel_order = pickle.load(file)

        [obj.setFont(font1) for obj in h1_list]
        [obj.setFont(font2) for obj in h2_list]
        [obj.setFont(font3) for obj in h3_list]

        [self.cb_list[i].setCurrentText(self.excel_order[i]) for i in range(len(self.excel_order))]
        self.current_values = {cb:cb.currentIndex() for cb in self.cb_list}
        
        self.btn_open.clicked.connect(self.open_browser)
        self.btn_crawl.clicked.connect(self.crawling)
        self.btn_order_save.clicked.connect(self.save_col)

        [obj.currentIndexChanged.connect(self.update_comboboxes) for obj in self.cb_list]
        self.post_company_dict = {}


    def update_comboboxes(self):
        sender = self.sender()
        cb_idx = 0
        for idx, cb in enumerate(self.cb_list):
            if sender == cb:
                selected_index = cb.currentIndex()
                cb_idx = idx
                break
        for cb in  self.cb_list:
            if sender == cb:
                continue
            if selected_index == cb.currentIndex():
                pre_idx = self.current_values[self.cb_list[cb_idx]]
                self.current_values[self.cb_list[cb_idx]] = selected_index
                self.current_values[cb] = pre_idx
                cb.setCurrentIndex(pre_idx)


    def open_browser(self):
        url = "https://world.taobao.com/"
        url = "https://buyertrade.taobao.com/trade/itemlist/list_bought_items.htm"
        url = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe --remote-debugging-port=9222 --user-data-dir="C:/ChromeDevSession"'
        """
        """
        # chrome_options = Options()
        # chrome_options.add_experimental_option("detach", True)
        # # driver = webdriver.Chrome(options=chrome_options)
        # # chrome_options.add_experimental_option("debuggerAddress", "127.0.0.1:9222")
        
        # # driver = webdriver.Chrome(service=Service('chromedriver'), options=chrome_options)
        # # driver.get(url)
        # url = 'http://localhost:9222' # 띄워진 브라우저의 URL
        # # chrome_options = Remote.webdriver.ChromeOptions()
        # chrome_options.add_experimental_option('debuggerAddress', 'localhost:9222') # 띄워진 브라우저의 주소 및 포트 번호 입력
        # driver = Remote(command_executor=url, options=chrome_options)
        # driver.maximize_window()
        # self.driver = driver


        PORT = 9222  # 디버깅 포트 설정
        chrome_options = webdriver.ChromeOptions()
        chrome_options.add_argument(r'user-data-dir=C:\remote-profile')  # Profile 경로 지정
        chrome_options.add_argument(f'remote-debugging-port={PORT}') # 디버깅 포트 설정
        chrome_options.add_experimental_option('detach', True)
        driver = webdriver.Chrome(options=chrome_options)

        # 불필요한 크롬창 제거
        if len(driver.window_handles) > 1:
            for handle in driver.window_handles[:-1]:
                driver.switch_to.window(handle)
                driver.close()
        driver.switch_to.window(driver.window_handles[0])       

        driver.get('https://world.taobao.com/')
        html_content = driver.page_source
        print(html_content)


        
        # DEBUGGING_PORT = 9222

        # # ChromeOptions 설정
        # chrome_options = webdriver.ChromeOptions()
        # chrome_options.add_experimental_option("debuggerAddress", f"localhost:{DEBUGGING_PORT}")

        # # ChromeDriver 실행 (자동화 브라우저가 아닌 현재 열려있는 탭 제어)
        # driver = webdriver.Chrome(options=chrome_options)

        # # 예: 현재 탭에서 Google 페이지 열기
        # driver.get("https://www.example.com")
        # html_content = driver.page_source
        # print(html_content)
 

    
    def crawling(self):
        self.driver.get("https://world.taobao.com/")


    def copy_clipboard(self, df):
        pass
    

    def save_col(self):
        self.excel_order = [cb.currentText() for cb in self.cb_list]
        
        with open(self.column_path, 'wb') as file:
            pickle.dump(self.excel_order, file)


    def get_post_company(soup):
        pass


if __name__ == "__main__":
    app = QApplication(sys.argv)
    myWindow = WindowClass()
    myWindow.show()
    app.exec()