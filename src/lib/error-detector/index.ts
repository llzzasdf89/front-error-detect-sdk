import {
    ajaxErrorDetector
} from './ajaxErrorDetector'
export class ErrorDetector {
    private errorCache = []
    constructor(){

    }
    init() {
        new ajaxErrorDetector()
    }
}