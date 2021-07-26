const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());
const fs = require('fs');
const readline = require('readline');
const rl = readline.createInterface( {
    input: process.stdin,
    output: process.stdout
});

let userid = process.argv[2];
let userpassword = process.argv[3];

const exec = require('child_process').execSync;

function timer(ms) {
    return new Promise(res => setTimeout(res, ms));
}

async function saveLog(msg) {
    console.log(msg);
    fs.appendFileSync('./log', msg + '\n', 'utf8');
}

async function saveConfig(problemIds) {
    let previousIds = await loadConfig();
    previousIds.push(problemIds);
    previousIds.sort();
    fs.writeFileSync('./previous.json', JSON.stringify(previousIds), 'utf8');
}

async function loadConfig() {
    let previousIds = [];
    if (fs.existsSync('./previous.json'))
        previousIds = JSON.parse(fs.readFileSync('./previous.json', 'utf8'));
    return previousIds;
}


async function gitCommit(problemId, timeStamp) {
    exec(`cd downloads && git add . && git commit -m "${problemId}.cpp Solved"`);
    
    let dateArray = (timeStamp.replace(/ /g, "").replace(/[^0-9]/g,'.')).split('.');
    --dateArray[1];
    const dateString = (new Date(...dateArray)).toString();
    console.log(`git commit --amend --no-edit --date "${dateString.slice(0, dateString.indexOf("GMT") + 3).replace("GMT", "KST")}"`);
    exec(`cd downloads && git commit --amend --no-edit --date "${dateString.slice(0, dateString.indexOf("GMT") + 3).replace("GMT", "KST")}"`)
}

async function pushToGit() {
    exec('cd downloads && git push origin master');
}


async function getProblemIds(page) {
    let previousIds = await loadConfig();
    let temp = await page.evaluate(() => {
        let data = document.getElementsByClassName("panel-body")[0].children;
        let problemIds = []
        for (let i = 0; i < data.length; ++i)
            problemIds.push(data[i].innerText);
        return problemIds;
    });

    let problemIds = [];
    for (let pId of temp) {
        if (previousIds.includes(pId))
            continue;
        problemIds.push(pId);
    }
    saveLog(`${problemIds.length} New Problems Found!`);
    return problemIds;
}

async function saveSource(page, sourceLink) {
    await page.goto(sourceLink);
    saveLog(`WebPage landed at ${sourceLink}`);

    let source = await page.evaluate(() => document.getElementsByName("source")[0].innerText);

    let infoArray = await page.evaluate(() => {
        let infoArray = [];
        let length = document.getElementsByTagName("thead")[0].children[0].children.length;
        for (let i = 0; i < length; ++i) {
            let property = document.getElementsByTagName("thead")[0].children[0].children[i].innerText;
            let value;
            if (i == 9)
                value = document.getElementsByTagName("tbody")[0].children[0].children[i].children[0].getAttribute('data-original-title');
            else    
                value = document.getElementsByTagName("tbody")[0].children[0].children[i].innerText;

            infoArray.push({property, value});
        }
        return infoArray;
    })

    let problemId = infoArray[2].value;
    saveLog(`Estimated Problem Id : ${problemId}`);

    if(!fs.existsSync('./downloads'))
        fs.mkdirSync('./downloads');

    let secondaryFolder = problemId * 1 - (problemId * 1) % 1000;
    if(!fs.existsSync(`./downloads/${secondaryFolder}`))
        fs.mkdirSync(`./downloads/${secondaryFolder}`);

    fs.writeFileSync(`./downloads/${secondaryFolder}/${problemId}.cpp`, source, "utf8");
    fs.writeFileSync(
        `./downloads/${secondaryFolder}/${problemId}.json`, 
        JSON.stringify(infoArray).replace(/},/gi, '},\n\t').replace('[','[\n\t').replace('}]','}\n]')
        , "utf8"
    );
    saveLog(`File writed ${problemId}.cpp And ${problemId}.json`);
    saveConfig(problemId);
    await gitCommit(problemId, infoArray[9].value);

    let time = 1000 * Math.floor(Math.random() * 20) + 10000;
    console.log(`waiting ${time}ms`);
    // wait 10~30 seconds random to avoid block account and avoid server overload
    await timer(time);
}

async function getSources(page) {
    let problemIds = await getProblemIds(page);

    for (let i = 0; i < problemIds.length; ++i) {
        let secondaryFolder = problemIds[i] * 1 - (problemIds[i] * 1) % 1000;
        if (fs.existsSync(`./downloads/${secondaryFolder}/${problemIds[i]}.cpp`)){
            saveConfig(problemIds[i]);
            continue;
        }

        await page.goto(`https://www.acmicpc.net/status?from_mine=1&problem_id=${problemIds[i]}&user_id=${userid}`);

        saveLog(`[#${i}]Problem ${problemIds[i]}`);

        let sourceLink = await page.evaluate(() => {
            let tr = document.getElementById("status-table").getElementsByTagName('tbody')[0].getElementsByTagName('tr');
            let ret;
            for (let i = 0; i < tr.length; ++i) {
                if (tr[i].getElementsByClassName('result-ac')[1]) {
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


async function checkLoginInfo() {
    async function inputId() {
        process.stdout.write("ID : ");
        await new Promise(resolve => 
            rl.on("line", function(line) {
            userid = line;
            rl.close();
            resolve();
        }));
    }

    async function inputPw() {
        process.stdout.write("PW : ");
        await new Promise(resolve => 
            rl.on("line", function(line) {
            userpassword = line;
            rl.close();
            resolve();
        }));
    }

    if (process.argv.length < 4) {
        if (process.argv.length == 2) 
            await inputId();
        await inputPw();
        console.log(1);
    }
}

 
async function doPuppeteer() {
    await checkLoginInfo();

    const browser = await puppeteer.launch({
        executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        headless: false,
        ignoreHTTPSErrors: true,
        userDataDir: './tmp'
    });
    const page = await browser.newPage();
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Whale/2.9.114.33 Safari/537.36");
    
    // Go to login page that redirect to userPage
    await page.goto(`https://www.acmicpc.net/login?next=%2Fuser%2F${userid}`);
    
    // login
    await page.evaluate((userid, userpassword) => {
        document.getElementsByName("login_user_id")[0].value = userid;
        document.getElementsByName("login_password")[0].value = userpassword;
    }, userid, userpassword);

    await timer(1000);

    await page.evaluate(() => {
        document.getElementById("submit_button").click();
    });
    
    // wait for loginButton work correctly.
    await page.waitForNavigation();
    
    await getSources(page);

    browser.close();
    console.log('done');

    await pushToGit();

    process.exit();
}

doPuppeteer();

