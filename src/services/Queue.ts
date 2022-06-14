export interface QueueOptions {
    size: number;
}

export class Queue<T> {
    private queue: (T | null)[] = [];

    constructor(
        private readonly options: QueueOptions
    ) {
        this.clear();
    }

    push(item: T): void {
        const freeCellIndex = this.queue.findIndex((value) => !value);

        if (freeCellIndex > -1) {
            this.queue[freeCellIndex] = item;
            return;
        }

        this.queue = [...this.queue.slice(1, this.options.size), item];
    }

    pop(): T | null {
        return null;
    }

    clear(): void {
        this.queue = Array.from({length: this.options.size}, () => null);
    }

    getAll(): (T | null)[] {
        return this.queue;
    }
}
