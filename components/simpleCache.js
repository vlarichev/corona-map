// Easy Function, to impliment 
// Hourly
//

export class simpleCache {
    constructor(){
        const timeId = 'lastCall';
        this.storageEnabled = function(){
            var test = 'test';
            try {
                localStorage.setItem(test, test);
                localStorage.removeItem(test);
                return true;
            } catch(e) {
                return false;
            }
        }
        this.useCachesVersion = function(){
            //check if same date and same hour, not minutes
            var cD = new Date;
            var dateStamp = cD.getMonth()+"-"+cD.getDate()+"-"+cD.getHours();
            var storedTime = _get(timeId);

            // is this call in same stamp? 
            if(storedTime && storedTime == dateStamp){
                console.log("found same Stamp " + dateStamp)
                //retrun cache
                return true
            } 
            else{
                _set(timeId, dateStamp);
                console.log("setting new Stamp " + dateStamp)
                return false;
            }
        }
        function _url(url){
            var arr = url.split('/');
            return "vl_"+(arr[arr.length-1]).slice(0,3)+arr.length;
        }
        this.getFromCache = function(longURL,cb){
            var url = _url(longURL);
            var useStorage = this.storageEnabled();
            var useCache = this.useCachesVersion();
            var res = _get(url);
            if(useStorage & useCache & res){
                cb(JSON.parse(res));
            }
            else if(useStorage){
                fetch(url)
                .then(a => {
                    _set(url,JSON.stringify(a));
                    cb(a)
                })
            }
            
            else {
                fetch(url).then(a => cb(a))
            }
        }
        function request(url){
            fetch(url).then(a => a.json).then(res => {
                console.log(res);
                //_set(url,res);
            })
        }
        function _get(id){
            var found = localStorage.getItem(id);
            console.log("YEEY getting " + id + " found ", found)
            return found
        }
        function _set(id, stuff){
            console.log("setting " + id, stuff)
            localStorage.setItem(id, stuff);
        }
        }
}