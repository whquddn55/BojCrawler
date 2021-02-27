#	How to use
```
	I made it with nodejs, puppeteer(puppeteer-extra, puppeteer-extra-plugin-stealth)!
	First, if your environment hasn't nodsjs, download it form https://nodejs.org/
	Second, download zip from github https://github.com/whquddn55/BojCrawler
	Third, extract zip and on extracted folder, run command 'npm install' at commandline to download node_modules that download resources to run this app 
	Fourth, on extracted folder, run command 'node app.js {yourid} {yourpassword}'!

	On default, puppeteer will run on not headless mode! If you wants to run on headless mode, run command this app via 'node app.js {id} {pw} true'!
	because third arguments default value is false

	nodejs와 puppeteer(puppeteer-extra, puppeteer-extra-plugin-stealth)로 제작하였습니다.
	첫 번째로, nodejs가 설치되어 있지 않으면 https://nodejs.org/ 에서 nodejs를 설치해주세요.
	두 번째로, https://github.com/whquddn55/BojCrawler 에서 압축파일을 다운받아주세요.
	세 번째로, 압축을 풀고, 파일이 있는 폴더에서 'npm install'명령어를 실행시켜주세요. 이 명령어는 nodejs와 puppeteer를 실행하기위한 리소스를 다운받습니다.
	네 번째로, 파일이 있는 폴더에서 'node app.js {아이디} {비밀번호}'를 입력해주세요.

	기본적으로 puppeteer가 headless가 아닌 모드로 켜지게 됩니다. headless모드로 실행하고 싶다면, 'node app.js {아이디} {비밀번호} true'로 실행해주세요. 세번째 매개변수 값이 false입니다.
```

#	Features
###	1.  doPuppeteer
+	Main함수입니다. puppeteer을 실행하고, userAgent를 설정해줍니다.
+	사용자의 신뢰를 위해 기본적으로 headless모드로 동작하지 않습니다. 

###	2.	login(page)
+	boj.kr의 login페이지로 이동하여 매개변수로 들어온 값들을 이용해 로그인합니다.
+	로그인에 성공하면 유저정보 페이지로 이동합니다.
+	실패할 경우, 더 이상 진행되지 않습니다.

### 3.	getSources(page)
+	getProblemdIds(page)를 호출하여 ac된 문제들의 id를 크롤링해옵니다.
+	문제 id의 제출정보로 이동하여 ac된 코드 중, 가장 최근에 푼 코드의 link를 가져옵니다.
+	saveSource(page, soruceLink)를 호출하여 가져온 link의 소스코드를 저장합니다.

### 4.	getProblemIds(page)
+	유저정보 페이지에서 ac된 id들을 크롤링해옵니다.

### 5.	saveSource(page, sourceLink)
+	sourceLink로 페이지를 이동합니다.
+	sourceLink의 소스코드를 {문제번호}.cpp로 저장합니다.
+	활용될 수 있는 다른 정보들을 {문제번호}.json으로 저장합니다.
+	**boj서버의 과부하를 막기위해 10~30초를 랜덤하게 작동을 멈춥니다.**




```	
boj에서는 crawling을 금지하고 있습니다. 
최대한 서버에 지장 없게 만들기 위해 
수작업으로 소스코드를 긁어오는 것과 비슷하게 시간이 걸리거나 
오히려 더 오래 걸리게 설정해놓았습니다.
해당 소프트웨어를 사용해서 얻는 불이익은 개발자가 책임지지 않습니다.
단순히 nodejs와 javascript의 공부를 위해 제작한 프로그램임을 알립니다. 
```