            let number = document.getElementById("number");
            let counter = 0;

            let mCounter = 2;
            let kCounter = 2;
            let studyCounter = 2;
            let dayCounter = 2;

            let exp = 65;
            let curLevel = 3;
            let nextLevel = curLevel + 1;

            while(true)
            {
                if (click (onClick) == True)
                {
                    mCounter += 1;
                }

                if (document.addEventListener('keydown', (event)))
                {
                    kCounter += 1;
                }

                studyCounter += 30 // time

                dayCounter += 1;
                
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
