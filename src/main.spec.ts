import { expect } from 'chai';
import { TestScheduler } from 'rxjs/testing';

function testSuiteExecution() {
    describe('RxBookTracker Tests', () => {

        let scheduler: TestScheduler;

        beforeEach(() => {
            scheduler = new TestScheduler((actual, expected) => {
                expect(actual).deep.equal(expected)
            });
        });

        it('Produces a single value and completion message', () => {

        });

        it('test 2', () => {

        });

        it('test 3', () => {

        });
    });
}

testSuiteExecution();


/*



function testSuiteExecution() {
    describe('RxBookTracker Tests', () => {

        let scheduler: TestScheduler;

        beforeEach(() => {
            scheduler = new TestScheduler((actual, expected) => {
                expect(actual).deep.equal(expected)
            });
        });

        it('Produces a single value and completion message', () => {
            scheduler.run(helpers => {
                const source$ = helpers.cold('a|');
                const expected = 'a|';

                helpers.expectObservable(source$).toBe(expected);
            })
        });

        it('test 2', () => {

        });

        it('test 3', () => {

        });
    });
}

testSuiteExecution();
*/