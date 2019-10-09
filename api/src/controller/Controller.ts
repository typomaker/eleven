abstract class Controller<ParamsT, ResultT> {
    public abstract run(params:ParamsT):ResultT;
}


export default Controller;
