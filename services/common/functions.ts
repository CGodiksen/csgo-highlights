import util from 'util';
import exec from 'child_process';

const promiseExec = util.promisify(exec.exec);

export { promiseExec };