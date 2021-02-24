import { Observable, Observer, OperatorFunction, MonoTypeOperatorFunction, Subject, ConnectableObservable } from 'rxjs';
import { asyncScheduler, asapScheduler, queueScheduler } from 'rxjs';
import { of, from, fromEvent, concat, merge, interval, throwError } from 'rxjs';
import { map, filter, mergeMap, tap, catchError, take, takeUntil, observeOn } from 'rxjs/operators';
import { multicast, refCount, publish, share, publishLast, publishBehavior, publishReplay } from 'rxjs/operators';
import { allReaders, allBooks, Book, Reader } from './data';
import { displayItem } from './display-helper';
import { ajax, AjaxRequest, AjaxResponse } from 'rxjs/ajax';


function example1() {
    // This function defines what will be observed, or, subscribed to.
    function subscribe(subscriber: any) {

    }

    const allBooks$ = new Observable(subscribe);
    // An Observable is not executed until an 
    // object subscribes to it. This is the subscriber.
    allBooks$.subscribe((book: Book) => displayItem(book.title));
}

// example1();

function example2(errorFlag: boolean) {
    const allBooks$ = new Observable(subscriber => {
        // calling error halts observation
        if (errorFlag) {
            subscriber.error('An error has been flagged.');
        }

        for (let book of allBooks) {
            subscriber.next(book);
        }

        setTimeout(() => {
            subscriber.complete();
        }, 2000);
    });

    // An Observable is not executed until an 
    // object subscribes to it. This is the subscriber.
    allBooks$.subscribe(
        (book: Book) => displayItem(book.title),
        (error: string) => displayItem(`ERROR: ${error}`),
        () => displayItem('Completed')
    );
}

/*
displayItem('No error');
example2(false);

displayItem('... Wait for it....');

setTimeout(() => {
    displayItem('Error flagged');
    example2(true);
}, 5000);

*/

function example3() {
    const source$ = of('hello', 10, true, allReaders[0].name);

    source$.subscribe(value => displayItem(value));
}

// example3();

function example4() {
    const source$ = from(allBooks);

    source$.subscribe(value => displayItem(value.title));
}

// example4();

function example5() {
    const source1$ = of('hello', 10, true, allReaders[0].name);
    const source2$ = from(allBooks);
    const source3$ = concat(source1$, source2$);

    source3$.subscribe(value => displayItem(value.toString()))
}

// example5();

function example6() {
    const button = document.getElementById('genericButton');
    
    fromEvent(button, 'click')
        .subscribe(event => {
            for (let reader of allReaders) {
                displayItem(reader.name);
            }
        });
}

// example6();

function example7() {
    const button = document.getElementById('genericButton');
    const requestOptions: AjaxRequest = {
        method: "GET",
        url: "http://localhost:3000/readers",
        crossDomain: true,
        responseType: 'json',
        headers: {
          'Content-Type': 'application/json',
        }
      };

    fromEvent(button, 'click')
        .subscribe(event => {
            ajax(requestOptions)
                .subscribe((ajaxResponse: AjaxResponse) => {
                    for (let reader of ajaxResponse.response) {
                        displayItem(reader.name);
                    }
                })
        });       
}

// example7();

function example8() {
    const anObserver: Observer<number> = {
        next: value => displayItem(`Value: ${value}`),
        error: err => displayItem(`ERROR: ${err}`),
        complete: () => displayItem('Complete')
    };

    const source$ = of(1, 3, 5, 7, 9);

    source$.subscribe(anObserver);
}

// example8();

function example9() {
    const source$ = of(1, 3, 5, 7, 9);
    // this creates an observer behind the scenes 
    source$.subscribe(
        (value: number) => displayItem(`Value: ${value}`),  // next
        (err: string) => displayItem(`ERROR: ${err}`),      // err
        () => displayItem('Complete')                       // complete
    );
}

// example9();

function example10() {
    const source$ = of(1, 3, 5, 7, 9);
    
    displayItem('---------------------------------------------------------') 

    source$.subscribe(
        (value: number) => displayItem(`Value: ${value}`),  // next
        (err: string) => displayItem(`ERROR: ${err}`),      // err
        () => displayItem('Complete')                       // complete
    );

    displayItem('---------------------------------------------------------') 

    source$.subscribe(
        (value: number) => displayItem(`Value: ${value}`),  // next
        (err: string) => displayItem(`ERROR: ${err}`),      // err
    );

    displayItem('---------------------------------------------------------') 

    source$.subscribe(
        (value: number) => displayItem(`Value: ${value}`),  // next
    );
}

// example10();

// Observers v. Subscribers
function example11(someNumbers: number[]) {
    // Create an observable based on someNumbers
    const numbers$ = new Observable(subscriber => {
        if (someNumbers.length === 0) {
            subscriber.error('No values');
        }

        for (let num of someNumbers) {
            if (num < 0) {
                subscriber.error(`Value out of range: ${num}.`);
            }

            subscriber.next(num);
        }

        subscriber.complete();
    });

    numbers$.subscribe(
        (value: number) => displayItem(`Value: ${value}`),  // next
        (err: string) => displayItem(`ERROR: ${err}`),      // err
        () => displayItem('Complete')                       // complete
    );
}

/*
const someNumbers1 = [1, 3, 5, 7, 9];
example11(someNumbers1);

displayItem('---------------------------------------------');

const someNumbers2: number[] = [];
example11(someNumbers2);

displayItem('---------------------------------------------');

const someNumbers3: number[] = [11, 12, -8];
example11(someNumbers3);
*/

function example12() {
    const books$ = from(allBooks);

    const booksObserver = {
        next: (book: Book) => displayItem(`Title: ${book.title}`),
        error: (err: string) => displayItem(`ERROR: ${err}`),
        complete: () => displayItem('Complete')
    }

    books$.subscribe(booksObserver);
}

// example12();

function example13() {
    const books$ = from(allBooks);

    // rxjs creates an observer behind the scenes
    books$.subscribe(
        (book: Book) => displayItem(`Title: ${book.title}`),
        (err: string) => displayItem(`ERROR: ${err}`),
        () => displayItem('Complete')
    );   
}

// example13();

function example14() {
    const books$ = from(allBooks);

    // rxjs creates an observer behind the scenes
    books$.subscribe(
        null,
        null,
        () => displayItem('Complete')
    );   
}

// example14();

// Observables may be independently observed by many observers.
// Each observer will cause execution of the observable subscriber method.

function example15() {
    const currentTime$ = new Observable(subscriber => {
        const timeString = new Date().toLocaleTimeString();
        subscriber.next(timeString);
        subscriber.complete();
    });

    currentTime$.subscribe(
        (value: string) => displayItem(`Observer1: ${value}`)
    );

    setTimeout(() => {
        currentTime$.subscribe(
            (value: string) => displayItem(`Observer2: ${value}`)
        )}
        ,
        2000
    );

    setTimeout(() => {
        currentTime$.subscribe(
            (value: string) => displayItem(`Observer2: ${value}`)
        )}
        ,
        4000
    );
}

// example15();

// An observer uses unsubscribe to stop listening to observable.
function example16() {
    const timer$ = interval(1000);

    const timerSubscription = timer$.subscribe((value: number) => {
        const stamp = `${new Date().toLocaleTimeString()}: ${value}`;
        displayItem(stamp);
    },
    null,
    () => displayItem('COMPLETE'));

    const button = document.getElementById('genericButton');
    
    fromEvent(button, 'click')
        .subscribe(event => timerSubscription.unsubscribe()
    );

}

// example16();

function example17() {
    const timer$ = new Observable(subscriber => {
        let i = 0;
        let intervalId = setInterval(() => {
            subscriber.next(i++);
        }, 1000);
        // return the cleanup method for the observable
        return () => {
            displayItem("Executing observable teardown.");
            clearInterval(intervalId);
        }
    });

    const timerSubscription = timer$.subscribe((value: number) => {
        const stamp = `${new Date().toLocaleTimeString()}: ${value}`;
        displayItem(stamp);
    },
    null,
    () => displayItem('COMPLETE'));

    const button = document.getElementById('genericButton');
    
    fromEvent(button, 'click')
        .subscribe(event => timerSubscription.unsubscribe()
    );

}

// example17();

// Each call to subscribe create two independent instances of the observable.
function example18() {
    const timer$ = new Observable(subscriber => {
        let i = 0;
        let intervalId = setInterval(() => {
            subscriber.next(i++);
        }, 1000);
        // return the cleanup method for the observable
        return () => {
            displayItem("Executing observable teardown.");
            clearInterval(intervalId);
        }
    });

    const timerSubscription = timer$.subscribe((value: number) => {
        const stamp = `${new Date().toLocaleTimeString()}: ${value}`;
        displayItem(stamp);
    },
    null,
    () => displayItem('COMPLETE'));

    const anotherTimerSubscription = timer$.subscribe((value: number) => {
        const date = new Date();
        let stamp = date.toLocaleTimeString() + date.toLocaleDateString();
        
        stamp = stamp + ` - ${value}`;
        displayItem(stamp);
    });

    // cancel both subscriptions at once
    timerSubscription.add(anotherTimerSubscription);

    const button = document.getElementById('genericButton');
    
    fromEvent(button, 'click')
        .subscribe(event => timerSubscription.unsubscribe()
    );
}

// example18();

// Operators

function example19() {
    // old school approach to using operators
    const source$ = of(1, 2, 3, 4, 5);
    // map is an rxjs operator that returns an OperatorFunction.
    // An OperatorFunction uses an Observable as a parameter and
    // returns a new Observable.
    const doubler = map((value: number) => value * 2);
    const doubled$ = doubler(source$);

    doubled$.subscribe(
        (value: number) => displayItem(value)
    );
}


// example19();

// Common syntax approach with operators.
function example20() {
    const source$ = of(1, 2, 3, 4, 5, 6, 7, 8);

    source$.pipe(
        map((value: number) => value * 2),
        filter((mappedValue: number) => mappedValue > 5)
    )
    .subscribe(
        (finalValue: number) => displayItem(`${finalValue}`)
    )
}

// example20();


function example21() {
    const requestOptions: AjaxRequest = {
        method: "GET",
        url: "http://localhost:3000/books",
        crossDomain: true,
        responseType: 'json',
        headers: {
          'Content-Type': 'application/json',
        }
      };
    
    ajax(requestOptions)
      .pipe(
          mergeMap(ajaxResponse => ajaxResponse.response),
          filter((book: Book) => book.publicationYear < 1950),
          tap((book: Book) => displayItem(book.publicationYear))
      )
      .subscribe((book: Book) => displayItem(book.title)
      );
}

// example21();

// catchError: error free
function example22() {
    const requestOptions: AjaxRequest = {
        method: "GET",
        url: "http://localhost:3000/books",
        crossDomain: true,
        responseType: 'json',
        headers: {
          'Content-Type': 'application/json',
        }
      };
    
    ajax(requestOptions)
      .pipe(
            mergeMap(ajaxResponse => ajaxResponse.response),
            filter((book: Book) => book.publicationYear < 1950),
            tap((book: Book) => displayItem(book.publicationYear)),
            catchError(err => of({title: 'Corduroy', author: 'Don Freeman'}))
      )
      .subscribe(
          (book: Book) => displayItem(book.title),
          (err: string) => displayItem(`ERROR: ${err}`)
      );
}

// example22();

// catchError: forced error via bad URL
function example23() {
    const requestOptions: AjaxRequest = {
        method: "GET",
        url: "http://localhost:3000/missing",
        crossDomain: true,
        responseType: 'json',
        headers: {
          'Content-Type': 'application/json',
        }
      };
    
    ajax(requestOptions)
      .pipe(
            mergeMap(ajaxResponse => ajaxResponse.response),
            filter((book: Book) => book.publicationYear < 1950),
            tap((book: Book) => displayItem(book.publicationYear)),
            catchError(err => of({title: 'Corduroy', author: 'Don Freeman'}))
      )
      .subscribe(
          (book: Book) => displayItem(book.title),
          (err: string) => displayItem(`ERROR: ${err}`)
      );
}

// example23();

// catchError: extended with throw
function example24() {
    const requestOptions: AjaxRequest = {
        method: "GET",
        url: "http://localhost:3000/missing",
        crossDomain: true,
        responseType: 'json',
        headers: {
          'Content-Type': 'application/json',
        }
      };
    
    ajax(requestOptions)
      .pipe(
            mergeMap(ajaxResponse => ajaxResponse.response),
            filter((book: Book) => book.publicationYear < 1950),
            tap((book: Book) => displayItem(book.publicationYear)),
            catchError(err => {throw `Failure occurred - ${err.message}`})
      )
      .subscribe(
          (book: Book) => displayItem(book.title),
          (err: string) => displayItem(`ERROR: ${err}`)
      );
}

// example24();

function example25() {
    const requestOptions: AjaxRequest = {
        method: "GET",
        url: "http://localhost:3000/missing",
        crossDomain: true,
        responseType: 'json',
        headers: {
          'Content-Type': 'application/json',
        }
      };
    
    ajax(requestOptions)
      .pipe(
            mergeMap(ajaxResponse => ajaxResponse.response),
            filter((book: Book) => book.publicationYear < 1950),
            tap((book: Book) => displayItem(book.publicationYear)),
            catchError(err => { return throwError(err.message)} )
      )
      .subscribe(
          (book: Book) => displayItem(book.title),
          (err: string) => displayItem(`ERROR: ${err}`)
      );
}

// example25();

function example26() {
    const timer$ = new Observable(subscriber => {
        let i = 0;
        let intervalId = setInterval(() => {
            subscriber.next(i++);
        }, 1000);
        // return the cleanup method for the observable
        return () => {
            displayItem("Executing observable teardown.");
            clearInterval(intervalId);
        }
    });

    // Completion and tear down are executed.
    timer$.pipe(
       take(5) 
    )
    .subscribe((value: number) => {
        const stamp = `${new Date().toLocaleTimeString()}: ${value}`;
        displayItem(stamp);
    },
    null,
    () => displayItem('COMPLETE'));
}

// example26();

function example27() {
    const timer$ = new Observable(subscriber => {
        let i = 0;
        let intervalId = setInterval(() => {
            subscriber.next(i++);
        }, 1000);
        // return the cleanup method for the observable
        return () => {
            displayItem("Executing observable teardown.");
            clearInterval(intervalId);
        }
    });

    const button = document.getElementById('genericButton');   
    const cancelTimer$ = fromEvent(button, 'click');
    
    timer$.pipe(
       takeUntil(cancelTimer$)
    )
    .subscribe((value: number) => {
        const stamp = `${new Date().toLocaleTimeString()}: ${value}`;
        displayItem(stamp);
    },
    null,
    () => displayItem('COMPLETE'));
}

// example27();

function example28() {
    const source$ = of(1, 2, 3, 4, 5);
    const doubler = map((value:number) => value * 2);
    const doubled$ = doubler(source$);

    doubled$.subscribe((value:number) => displayItem(`VALUE: ${value}`));
}

// example28();

function example29() {
    function doublerOperator(): OperatorFunction<number, number> {
        return map((value:number) => value * 2);
    }

    const source$ = of(1, 2, 3, 4, 5);

    source$.pipe(
        doublerOperator()
    )
    .subscribe(
        (doubledValue: number) => displayItem(`VALUE: ${doubledValue}`)
    )
}

// example29();

function example30() {

    function grabAndShowClassics(year: number, log: boolean) {
        return (source$: Observable<Book>) => {
            return new Observable(subscriber => {
                return source$.subscribe(       // use return for teardown
                    (book: Book) => {
                        if (book.publicationYear < year) {
                            subscriber.next(book);

                            if (log) {
                                displayItem(`Classic: ${book.title}`);
                            }
                        }
                    },
                    err => subscriber.error(err),
                    () => subscriber.complete()
                );
            });
        }
    }
    
    const requestOptions: AjaxRequest = {
        method: "GET",
        url: "http://localhost:3000/books",
        crossDomain: true,
        responseType: 'json',
        headers: {
          'Content-Type': 'application/json',
        }
      };
    
    ajax(requestOptions)
      .pipe(
          mergeMap(ajaxResponse => ajaxResponse.response),
          // Use custom operator to relace filter and tap.
          // ------------------------------------------------------
          // filter((book: Book) => book.publicationYear < 1950),
          // tap((book: Book) => displayItem(book.publicationYear))
          // ------------------------------------------------------
          grabAndShowClassics(1930, false)
        )
      .subscribe((book: Book) => displayItem(book.title)
      );   
}

// example30();

// Module 6.4
function example31() {
    function grabClassics(year: number): MonoTypeOperatorFunction<Book> {
        return filter((book: Book) => book.publicationYear < year);
    }

    const requestOptions: AjaxRequest = {
        method: "GET",
        url: "http://localhost:3000/books",
        crossDomain: true,
        responseType: 'json',
        headers: {
          'Content-Type': 'application/json',
        }
      };
    
    ajax(requestOptions)
      .pipe(
          mergeMap(ajaxResponse => ajaxResponse.response),

          grabClassics(1950)
        )
      .subscribe((book: Book) => displayItem(book.title)
      );   
}

// example31();

// Module 6.4
function example32() {
    function grabAndLogClassicsWithPipe(year: number, isLogged: boolean):
         (source: Observable<Book>) => Observable<Book> 
    {
        return (source$: Observable<Book>) => source$.pipe(
            filter((book: Book) => book.publicationYear < year),
            tap((classicBook: Book) => isLogged ? displayItem(classicBook.publicationYear) : null)
        );
    }

    const requestOptions: AjaxRequest = {
        method: "GET",
        url: "http://localhost:3000/books",
        crossDomain: true,
        responseType: 'json',
        headers: {
          'Content-Type': 'application/json',
        }
      };
    
    ajax(requestOptions)
      .pipe(
          mergeMap(ajaxResponse => ajaxResponse.response),

          grabAndLogClassicsWithPipe(1950, true)
        )
      .subscribe((book: Book) => displayItem(book.title)
      );   
}

// example32();

// Subjects and Multicasted Observables

function example33() {
    const subject$: Subject<string> = new Subject();

    subject$.subscribe(
        value => displayItem(`Observer 1: ${value}`)
    );

    subject$.subscribe(
        value => displayItem(`Observer 2: ${value}`)
    );

    subject$.next('Hello');

    const source$ = new Observable(subscriber => {
        subscriber.next('Greetings');
    });

    source$.subscribe(subject$);
}

example33();


// Cold and Hot Observables
// Cold: One observer per execution. Starts when subscribe is called. UNICAST
// Hot: Allows multiple observers. Value producers exists outside of observable. MULTICAST

// These are all cold UNICAST.
function example34() {
    const source$: Observable<number> = interval(1000).pipe(take(10));

    source$.subscribe(
        value => displayItem(`Observer 1: ${value}`)
    );

    setTimeout( () => {
        source$.subscribe(
            value => displayItem(`Observer 2: ${value}`)
        )       
    }, 1000);

    setTimeout( () => {
        source$.subscribe(
            value => displayItem(`Observer 3: ${value}`)
        )       
    }, 2000);
}

// example34();

// These are all hot MULTICAST.
function example35() {
    const source$: Observable<number> = interval(1000).pipe(take(10));
    const subject$: Subject<number> = new Subject<number>();

    source$.subscribe(subject$);

    subject$.subscribe(
        value => displayItem(`Observer 1: ${value}`)
    );

    setTimeout( () => {
        subject$.subscribe(
            value => displayItem(`Observer 2: ${value}`)
        )       
    }, 1000);

    setTimeout( () => {
        subject$.subscribe(
            value => displayItem(`Observer 3: ${value}`)
        )       
    }, 2000);
}

// example35();

// Multicasting Operators
// multicast()
// connect()
// refCount()
// publish()
// share()
function example36() {
    // cold, unicast observable made hot
    const source$: Observable<number> = interval(1000).pipe(
        take(10),
        multicast(new Subject())
    );

    source$.subscribe(
        value => displayItem(`Observer 1: ${value}`)
    );

    setTimeout( () => {
        source$.subscribe(
            value => displayItem(`Observer 2: ${value}`)
        )       
    }, 2000);

    setTimeout( () => {
        source$.subscribe(
            value => displayItem(`Observer 3: ${value}`)
        )       
    }, 4000);

    (source$ as ConnectableObservable<any>).connect();
}

// example36();

function example37() {
    // cold, unicast observable made hot
    const source$: Observable<number> = interval(1000).pipe(
        take(10),
        multicast(new Subject()),
        refCount()
    );

    source$.subscribe(
        value => displayItem(`Observer 1: ${value}`)
    );

    setTimeout( () => {
        source$.subscribe(
            value => displayItem(`Observer 2: ${value}`)
        )       
    }, 2000);

    setTimeout( () => {
        source$.subscribe(
            value => displayItem(`Observer 3: ${value}`)
        )       
    }, 4000);
}

// example37();

function example38() {
    // cold, unicast observable made hot
    const source$: Observable<number> = interval(1000).pipe(
        take(5),
        publish(),
        refCount()
    );

    source$.subscribe(
        value => displayItem(`Observer 1: ${value}`)
    );

    setTimeout( () => {
        source$.subscribe(
            value => displayItem(`Observer 2: ${value}`)
        )       
    }, 2000);

    setTimeout( () => {
        source$.subscribe(
            value => displayItem(`Observer 3: ${value}`)
        )       
    }, 4000);

    setTimeout( () => {
        source$.subscribe(
            value => displayItem(`Observer 4: ${value}`),
            null,
            () => displayItem('Completed: 4')
        )       
    }, 6000);
}

// example38();

function example39() {
    // cold, unicast observable made hot
    const source$: Observable<number> = interval(1000).pipe(
        take(5),
        share()
    );

    source$.subscribe(
        value => displayItem(`Observer 1: ${value}`)
    );

    setTimeout( () => {
        source$.subscribe(
            value => displayItem(`Observer 2: ${value}`)
        )       
    }, 2000);

    setTimeout( () => {
        source$.subscribe(
            value => displayItem(`Observer 3: ${value}`)
        )       
    }, 4000);

    setTimeout( () => {
        source$.subscribe(
            value => displayItem(`Observer 4: ${value}`),
            null,
            () => displayItem('Completed: 4')
        )       
    }, 6000);
}

// example39();

// Specialized subjects

// publishLast
function example40() {
    // cold, unicast observable made hot
    const source$: Observable<number> = interval(1000).pipe(
        take(5),
        publishLast(),
        refCount()
    );

    source$.subscribe(
        value => displayItem(`Observer 1: ${value}`)
    );

    setTimeout( () => {
        source$.subscribe(
            value => displayItem(`Observer 2: ${value}`)
        )       
    }, 2000);

    setTimeout( () => {
        source$.subscribe(
            value => displayItem(`Observer 3: ${value}`)
        )       
    }, 4000);

    setTimeout( () => {
        source$.subscribe(
            value => displayItem(`Observer 4: ${value}`),
            null,
            () => displayItem('Completed: 4')
        )       
    }, 6000);
}

// example40();

// publishhBehavior
function example41() {
    // cold, unicast observable made hot
    const source$: Observable<number> = interval(1000).pipe(
        take(5),
        publishBehavior(42),
        refCount()
    );

    source$.subscribe(
        value => displayItem(`Observer 1: ${value}`)
    );

    setTimeout( () => {
        source$.subscribe(
            value => displayItem(`Observer 2: ${value}`)
        )       
    }, 2000);

    setTimeout( () => {
        source$.subscribe(
            value => displayItem(`Observer 3: ${value}`)
        )       
    }, 4000);

    setTimeout( () => {
        source$.subscribe(
            value => displayItem(`Observer 4: ${value}`),
            null,
            () => displayItem('Completed: 4')
        )       
    }, 6000);
}

// example41();

// publishReplay
function example42() {
    // cold, unicast observable made hot
    const source$: Observable<number> = interval(1000).pipe(
        take(5),
        publishReplay(),
        refCount()
    );

    source$.subscribe(
        value => displayItem(`Observer 1: ${value}`)
    );

    setTimeout( () => {
        source$.subscribe(
            value => displayItem(`Observer 2: ${value}`)
        )       
    }, 2000);

    setTimeout( () => {
        source$.subscribe(
            value => displayItem(`Observer 3: ${value}`)
        )       
    }, 4000);

    setTimeout( () => {
        source$.subscribe(
            value => displayItem(`Observer 4: ${value}`),
            null,
            () => displayItem('Completed: 4')
        )       
    }, 6000);
}

// example42();

//
// Controlling execution with schedulers - 8
//
// queueScheduler - for sync observables
// asyncScheduler - won't block JS event loop
// asapScheduler - async but uses micro task queue (higher priority)
// animationFrameScheduler - for animations
// TestScheduler - from rxjs/testing used for testing rxjs
//

function example43() {
    displayItem('Start Function');

    const queue$: Observable<string> = of('QueueScheduler (synchonous)', queueScheduler);
    const asap$: Observable<string> = of('AsapScheduler (ansyn micro task)', asapScheduler);
    const async$: Observable<string> = of('AsynchScheduler (async task)', asyncScheduler);
    const merged$: Observable<string> = merge(async$, asap$, queue$)

    merged$.subscribe(value => displayItem(value));

    displayItem('End Function');
}

// example43();

function example44() {
    displayItem('Start Function');

    from([1,2,3,4,5], queueScheduler)
        .pipe(
            tap(value => displayItem(`Value: ${value}`)),
            tap(value => displayItem(`Doubled: ${value * 2}`)) 
        )
        .subscribe();

    displayItem('End Function');
}

// example44();

function example45() {
    displayItem('Start Function');

    from([1,2,3,4,5], queueScheduler)
        .pipe(
            tap(value => displayItem(`Value: ${value}`)),
            observeOn(asyncScheduler),
            tap(value => displayItem(`Doubled: ${value * 2}`)) 
        )
        .subscribe();

    displayItem('End Function');
}

// example45();


//
// Testing RxJS
//

// npm install mocha ts-node chai @types/mocha --save-dev
// add to package.json: 
/*
  "scripts": {
    "start": "webpack-dev-server --mode development",
    "test": "mocha -r ts-node/register ** / *.spec.ts"   <= add this. remove spaces by ** and *
},
*/

// TestScheduler works only with AsyncScheduler

function example46() {
}