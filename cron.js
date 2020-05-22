import { Cron } from "https://deno.land/x/cron/cron.ts";

var c = new Cron();
c.start();

var debug = false;

var cron = (t, f) => {
    if(typeof t == 'boolean'){
        debug = t;
        return;
    }
    c.add(t, f);
    if(debug){
        console.table(c.cronJobs);
    }
};

export {cron};
