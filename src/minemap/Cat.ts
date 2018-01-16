
/// <reference path="./Animal" />
namespace flagwind {
    export class Cat extends Animal {
        public constructor(public name: string) {
            super(name);
            this.test();
        }
        public test() {
            console.log("test");
        }
    }

    export class Dog extends Cat {
        public constructor(public name: string) {
            super(name);
            this.test();
        }
        public test2() {
            console.log("test2");
        }
    }

}
