const eventList = [
    'abort',
    'error',
    'timeout'
]
type listenerCache = {
    [key:string]:(event:CustomEvent)=>void
}
interface errorCache {
    [key:string]:{
        _method:string,
        _url:string | URL ,
        _data:unknown,
        _date:number,
        _type:string,
        _id:string
    }
}
export class ajaxErrorDetector {
    //singleton
    private static instance:ajaxErrorDetector | null = null
    private errorCache:errorCache =  {

    }
    private listenerCache:listenerCache = {

    }
    constructor() {
        if(ajaxErrorDetector.instance) return ajaxErrorDetector.instance
        this.init()
        ajaxErrorDetector.instance = this
    }
    private init() {
        this._overrideOriginXHR()
        this._startListener()
    }
    private _overrideOriginXHR() {
        const originXMLHttpRequest = window.XMLHttpRequest;
        window.XMLHttpRequest = class extends XMLHttpRequest {
            constructor() {
                super()
                const xhr = new originXMLHttpRequest();
                let _method:string, _url:string | URL , _data:unknown;
                const originOpen = xhr.open
                const originSend = xhr.send
                xhr.open = function(method:string,url:string | URL, asyncFlag?:boolean):void {
                //record 'methods', 'url' when user invokes 'open' method
                _method = method;
                _url = url;
                originOpen.apply(xhr,[method,url,asyncFlag || false])
            }
            xhr.send = function(...args) {
                //record request params when use invokes 'send' method
                _data = args[0]
                originSend.apply(xhr,args)
            }
            eventList.forEach(eventName =>{
                xhr.addEventListener(eventName,function(event) {
                    //generate a custom event, record information when event trigger
                    const ajaxEvent = new CustomEvent('ajax' + eventName, {
                        detail:{
                            ...event,
                            _method,
                            _url,
                            _data,
                            _date:Date.now(),
                            _type:eventName,
                            _id: Math.random().toString(36).slice(2)
                        }
                    })
                    //trigger custom event
                    window.dispatchEvent(ajaxEvent)
                })
            })
            return xhr;
            }
        }
    }
    private _startListener() {
        eventList.forEach(eventName => {
            if(this.listenerCache[eventName]) return; 
            const listener = (event:Event):void => {
                if(!(event instanceof CustomEvent)) return;
                const {detail:{
                    _method = '',
                    _url = '',
                    _data = '',
                    _date = '',
                    _type = '',
                    _id = ''
                } = {}} = event;
                if(this.errorCache[_id]) return;
                this.errorCache[_id] = {
                    _method,
                    _url,
                    _data,
                    _date,
                    _type,
                    _id
                }
            }
            window.addEventListener('ajax' + eventName, listener)
            this.listenerCache[eventName] = listener
        })
    }
}