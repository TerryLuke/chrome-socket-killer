const chromeRemote = require('chrome-remote-interface');

chromeRemote(async (client) => {
    try {
        const { Network, Page, Runtime } = client;

        // 监听 Network 和 Page 事件
        await Network.enable();
        await Page.enable();
        await Runtime.enable();

        // 记录页面信息
        const result = await Runtime.evaluate({ expression: 'window.location.href' })
        const preUrl = result.result.value;

        // 调用 Page.navigate 方法并加载 chrome://net-internals/#sockets 页面
        await Page.navigate({ url: 'chrome://net-internals/#sockets' });
        await Page.loadEventFired();

        // 寻找并点击“立即清除连接”按钮
        await Runtime.evaluate({
            expression: 'document.getElementById("sockets-view-close-idle-button").click();',
        });

        await Runtime.evaluate({
            expression: 'document.getElementById("sockets-view-flush-button").click();',
        });

        await Page.navigate({ url: preUrl });
        await Page.loadEventFired();

        console.log('Disconnect all connections');

    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}).on('error', (err) => {
    console.error(err);
});
