var app = angular.module('app');

app.directive('messageItem', function() {
    return {
        restrict: "E",
        templateUrl: 'static/message-list/message-item/message-item.html',
        scope: {
            senderUuid: "@",
            content: "@"
        }
    }
});