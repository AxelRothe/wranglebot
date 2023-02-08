export default class RouteResult {
    status: number;
    result: any;
  constructor(status, result){
    this.status = status;
    this.result = result;
  }
}