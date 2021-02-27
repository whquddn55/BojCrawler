const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());
const fs = require('fs');

const userid = 'whquddn55'
const userpassword = 'whxnxl55;;'

function timer(ms) {
    return new Promise(res => setTimeout(res, ms));
}

async function getProblemIds(page) {
    return await page.evaluate(() => {
        let data = document.getElementsByClassName("panel-body")[0].children;
        let problemIds = []
        for (let i = 0; i < data.length; ++i)
            problemIds.push(data[i].innerText);
        return problemIds;
    });
}

async function saveSource(page, sourceLink) {
    await page.goto(sourceLink);
    console.log(`WebPage landed at ${sourceLink}`);

    let source = await page.evaluate(() => document.getElementsByName("source")[0].innerText);

    let infoArray = await page.evaluate(() => {
        let infoArray = [];
        let length = document.getElementsByTagName("thead")[0].children[0].children.length;
        for (let i = 0; i < length; ++i) {
            let property = document.getElementsByTagName("thead")[0].children[0].children[i].innerText;
            let value = document.getElementsByTagName("tbody")[0].children[0].children[i].innerText;
            infoArray.push({property, value});
        }
        return infoArray;
    })

    let problemId = infoArray[2].value;
    console.log(`Estimated Problem Id : ${problemId}`);

    fs.writeFileSync(`./downloads/${problemId}.cpp`, source, "utf8");
    fs.writeFileSync(
        `./downloads/${problemId}.json`, 
        JSON.stringify(infoArray).replace(/},/gi, '},\n\t').replace('[','[\n\t').replace('}]','}\n]')
        , "utf8"
    );
    console.log(`File writed ${problemId}.cpp And ${problemId}.json`);

    // wait 10~30 seconds random to avoid block account and avoid server overload
    await timer(1000 * Math.floor(Math.random() * 20) + 10000);
}

async function getSources(page) {
    let problemIds = await getProblemIds(page);
    console.log(problemIds, problemIds.length);

    for (let i = 0; i < problemIds.length; ++i) {
        await page.goto(`https://www.acmicpc.net/status?from_mine=1&problem_id=${problemIds[i]}&user_id=${userid}`);
        console.log(`[#${i}]Problem ${problemIds[i]}`);
        let sourceLink = await page.evaluate(() => {
            let tr = document.getElementById("status-table").getElementsByTagName('tbody')[0].getElementsByTagName('tr');
            let ret;
            for (let i = 0; i < tr.length; ++i) {
                if (tr[i].children[3].innerText == "맞았습니다!!") {
                    ret = tr[i].children[6].children[0].href;
                    break;
                }
            }

            return ret;
        });
        await timer(1000);

        await saveSource(page, sourceLink);
    }
}
 
const doPuppeteer = async() => {
    const browser = await puppeteer.launch({
        headless : false
    });
    const page = await browser.newPage();
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Whale/2.9.114.33 Safari/537.36");
    
    // Go to login page that redirect to userPage
    await page.goto(`https://www.acmicpc.net/login?next=%2Fuser%2F${userid}`);
    
    // login
    await page.evaluate((userid, userpassword) => {
        document.getElementsByName("login_user_id")[0].value = userid;
        document.getElementsByName("login_password")[0].value = userpassword;
        document.getElementById("submit_button").click();
    }, userid, userpassword);
    
    // wait for loginButton work correctly.
    await page.waitForNavigation();
    
    await getSources(page);
    
    
    

    // let data = [];
    // let previous = [];
    // while(browser.isConnected()) {
    //     await page.reload();
    //     data = await page.evaluate(() => {
    //         let titles = document.getElementsByClassName("list_title");
    //         let data = [];
            
    //         for (var i = 0; i < titles.length; ++i)
    //             data.push(titles[i].innerText);
    //         return data;
    //     })

    //     if (previous.length) {
    //         let shiftedIndex = data.indexOf(previous[0]);
    //         for (let i = shiftedIndex - 1; i >= 0; --i) 
    //             console.log(`[NEW] ${data[i]}`);
    //     }
    //     previous = data.slice();
    //     await timer(10000);
    // }
}
 
 
doPuppeteer();
