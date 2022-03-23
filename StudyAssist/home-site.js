let number = document.getElementById("number");
let counter = 0;
let exp = 65;
let curLevel = 3;
let nextLevel = curLevel + 1;
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