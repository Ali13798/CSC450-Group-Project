window.onload = function()
{
    let number = document.getElementById("number");
    let counter = 0;


    var mouseHeaders = new Headers();
    mouseHeaders.append('Mouse-Data', 'mCounter');
    mouseHeaders.get('mouseClick.txt');
    var mouseInit = 
    {
        method: 'GET',
        headers: mouseHeaders,
        mode: 'cors',
        cache: 'default'
    };
    var mouseclickCount = new Request('mouseClick.txt', mouseInit);



    var keyHeaders = new Headers();
    keyHeaders.append('Key-Data', 'kCounter');
    keyHeaders.get('keystroke.txt');
    var keyInit = 
    {
        method: 'GET',
        headers: keyHeaders,
        mode: 'cors',
        cache: 'default'
    };
    var keystrokeCount = new Request('keystroke.txt', keyInit);



    var timeHeaders = new Headers();
    timeHeaders.append('Time-Data', 'tCounter');
    timeHeaders.get('keystroke.txt');
    var timeInit = 
    {
        method: 'GET',
        headers: timeHeaders,
        mode: 'cors',
        cache: 'default'
    };
    var timeCount = new Request('studyTime.txt', timeInit);



    var streakHeaders = new Headers();
    streakHeaders.append('Streak-Data', 'sCounter');
    streakHeaders.get('streak.txt');
    var streakInit = 
    {
        method: 'GET',
        headers: streakHeaders,
        mode: 'cors',
        cache: 'default'
    };
    var streakCount = new Request('streak.txt', streakInit);


    var expHeaders = new Headers();
    expHeaders.append('Streak-Data', 'sCounter');
    expHeaders.get('streak.txt');
    var expInit = 
    {
        method: 'GET',
        headers: expHeaders,
        mode: 'cors',
        cache: 'default'
    };
    var expCount = new Request('exp.txt', expInit);



    let curLevel = 3;
    let nextLevel = curLevel + 1;
    
/* END NEW REQUEST*/



let number = document.getElementById("number");
let counter = 0;

let mCounter = 2; // total
let mCounterToday = 0; // daily and adds to total
let kCounter = 2; // total
let kCounterToday = 0; // daily and adds to total
let studyCounter = 2;
let dayCounter = 2;

let exp = 65;
let curLevel = 3;
let nextLevel = curLevel + 1;

while(true)
{
    if (click (onClick) == True)
    {
        mCounterToday += 1; // add counter to mouse counter
    }

    if (document.addEventListener('keydown', (event)))
    {
        kCounterToday += 1;
    }

    // if session is ended, add time to studyCounter, add 1 because of day used
    studyCounter += 30 * 1.5 // time. Should be 1-1 then multiply by 1.5.

    dayCounter += 1;
    
    exp = exp + studyCOunter + (mCOunterToday * .15) + (kCounterToday * 0.15) + 1;
    
    mCounter += mCounter + mCounterToday; // update running total for stats
    
    kCounter += mCounter + mCounterToday; // update running total for stats
    
    
    
    // Check if level up, if so, add level and modulo exp. Also check each levelup for a reward alert!
    if (exp > 300)
    {
        exp = exp % 300;
        curLevel += 1;
        if (curLevel % 10 == 0)
        {
            alert("You achieved a level milestone! You deserve an ice cream!")
        }
        else
        {
            alert("You leveled up! Reach a multiple of 10 and you can ask for a reward!")
        }
        
        curLevel += 1;
        if (curLevel % 10 == 0)
        {
            alert("You achieved a level milestone! You deserve an ice cream!")
        }
        else
        {
            alert("You leveled up! Reach a multiple of 10 and you can ask for a reward!")
        }
        
        curLevel += 1;
        if (curLevel % 10 == 0)
        {
            alert("You achieved a level milestone! You deserve an ice cream!")
        }
        else
        {
            alert("You leveled up! Reach a multiple of 10 and you can ask for a reward!")
        }
    }
    
    else if (exp > 200)
    {
        exp = exp % 200;
        
        curLevel += 1;
        if (curLevel % 10 == 0)
        {
            alert("You achieved a level milestone! You deserve an ice cream!")
        }
        else
        {
            alert("You leveled up! Reach a multiple of 10 and you can ask for a reward!")
        }
        
        curLevel += 1;
        if (curLevel % 10 == 0)
        {
            alert("You achieved a level milestone! You deserve an ice cream!")
        }
        else
        {
            alert("You leveled up! Reach a multiple of 10 and you can ask for a reward!")
        }
    }
    
    else if (exp > 100)
    {
        exp = exp % 100;
        curLevel += 1;
        if (curLevel % 10 == 0)
        {
            alert("You achieved a level milestone! You deserve an ice cream!")
        }
        else
        {
            alert("You leveled up! Reach a multiple of 10 and you can ask for a reward!")
        }
    }
    

}

setInterval(() => {
    {
        if (counter == exp) // The number we define
        {
            clearInterval();
        }
        else
        {
            counter += 1;
            number.innerHTML = counter + "%";
        }
    }
}, 30);
