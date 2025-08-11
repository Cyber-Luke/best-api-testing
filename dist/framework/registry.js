class _TestRegistry {
    tests = new Map();
    register(t) {
        const existing = this.tests.get(t.name);
        if (existing) {
            existing.fn = t.fn;
            existing.auth = t.auth;
            existing.target = t.target;
            return;
        }
        this.tests.set(t.name, { ...t, steps: [] });
    }
    addStep(testName, step) {
        const test = this.tests.get(testName) || {
            name: testName,
            auth: false,
            fn: async () => undefined,
            steps: [],
        };
        if (!this.tests.has(testName))
            this.tests.set(testName, test);
        const order = test.steps.length;
        test.steps.push({ ...step, order });
    }
    list() {
        return Array.from(this.tests.values());
    }
}
export const TestRegistry = new _TestRegistry();
//# sourceMappingURL=registry.js.map