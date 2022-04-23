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
