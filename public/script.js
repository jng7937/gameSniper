console.log("script.js loaded");
const dealsDiv = document.getElementById("dealsContainerDiv");
document.addEventListener("DOMContentLoaded", () => {
document.getElementById("form").addEventListener("submit", (e) => {
    //need to stop it from autosubmitting
    
    e.preventDefault();
    

    
   (async () => {
        try {
            const maxPrice = document.getElementById("maxPrice").value;
            const platformNum = document.getElementById("platform").value;
            const apiURL = `https://www.cheapshark.com/api/1.0/deals?storeID=${platformNum}&upperPrice=${maxPrice}`;
            console.log("APIURL",apiURL);
            
            const apiResponse = await fetch(apiURL);
            console.log(apiURL);
            const data = await apiResponse.json();
            console.log(`data after getting from API: ${data}`);

            
            const options= {
                method: "POST", 
                body: JSON.stringify({"data":data}),
                headers: { "Content-Type": "application/json" }
            }
            await fetch('/deals', options);
            window.location.href = '/deals';
        
        } catch (error) {
            console.error(`Couldnt get the data. ${error}`)
        }
  })();

});
});