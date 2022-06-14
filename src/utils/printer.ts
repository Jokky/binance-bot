type LogType = 'log' | 'warn' | 'error';

const LogMapFunction: Record<LogType, typeof console.log> = {
    'log': console.log,
    'warn': console.warn,
    'error': console.error,
}

const MIN_ROW_GAP = 3;

export const printer = () => {
    let result = '';

    const write = (value: string) => {
        result += value;
        return functions;
    };
    const writeLine = (value = '') => {
        result += `${value}\n`;

        return functions;
    };
    const table = (array: Array<Array<string>>, gap: number = MIN_ROW_GAP) => {
        const maxSizeColumns: Record<number, number> = {};

        for (let i = 0; i < array.length; i++) {
            for (let j = 0; j < array[i].length; j++) {
                if (!maxSizeColumns[j] || maxSizeColumns[j] < array[i][j].length) {
                    maxSizeColumns[j] = array[i][j].length;
                }
            }
        }

        for (let i = 0; i < array.length; i++) {
            let row = '';
            for (let j = 0; j < array[i].length; j++) {
                const cell = array[i][j];
                const delta = maxSizeColumns[j] - cell.length;
                const spaces = j === array[i].length - 1 ? '' : ' '.repeat(delta + gap);
                row += `${cell}${spaces}`;
            }
            result += `${row}\n`;
        }

        return functions;
    };

    const end = (type: LogType = 'log') => {
        LogMapFunction[type](result);
    };

    const value = () => result;

    const functions = {
        write,
        writeLine,
        table,
        value,
        end,
    };

    return functions;
};