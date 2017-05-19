describe('Console Service', function() {
    let sandbox;

    beforeEach(function() {
        module('app.services');
        bard.inject('Consoles', '$http','CollectionsApi','EventNotifications','$timeout','$window');
    });
    const successResponse = {
        'success': true,
        'message': 'launching console',
        'task_id': '1'
    };

    it('should try and open up a console', () => {
        const collectionsApiSpy = sinon.stub(CollectionsApi, 'post').returns(Promise.resolve(successResponse));
        const requestOptions = { action: "request_console", resource: { protocol: "html5" } };
        Consoles.open('12345');
        expect(collectionsApiSpy).to.have.been.calledWith('vms', '12345', {}, requestOptions);
    });
    
     it('should give an error if it failed but has a 200 status code', () => {
        const failureResponse = {
            'message': 'failed'
        };
        const eventNotificationsFailureSpy = sinon.spy(EventNotifications, 'error');

        const collectionsApiSpy = sinon.stub(CollectionsApi, 'post').returns(Promise.resolve(failureResponse));
        const requestOptions = { action: "request_console", resource: { protocol: "html5" } };
        return Consoles.open('12345').then((data)=>{
            expect(eventNotificationsFailureSpy).to.have.been.calledWith('There was an error opening the console. failed');
        });
     });
     it('should give a success notification if it was called and was successful', () => {
        const collectionsApiSpy = sinon.stub(CollectionsApi, 'post').returns(Promise.resolve(successResponse));
        const eventNotificationsSpy = sinon.spy(EventNotifications, 'info');
        const requestOptions = { action: "request_console", resource: { protocol: "html5" } };
        return Consoles.open('12345').then((data)=>{
            expect(eventNotificationsSpy).to.have.been.calledWith('Waiting for the console to become ready. ','launching console');
        });
     });

  it('should successfully start a spice session', function() {
        const taskResponse = {
                'state': 'Finished',
                'status': 'Ok',
                'task_results': { 
                    'proto':'spice',
                    'url':'blah',
                    'secret':'blah'
                }
            };
        const collectionsApiPostSpy = sinon.stub(CollectionsApi, 'post').returns(Promise.resolve(successResponse));
        const collectionsApiGetSpy = sinon.stub(CollectionsApi, 'get').returns(Promise.resolve(taskResponse));
        return Consoles.open('12345').then((data)=>{
            $timeout.flush()
            expect(collectionsApiGetSpy).to.have.been.calledWith('tasks', '1', { attributes: 'task_results' });
        }); 
    });
});
