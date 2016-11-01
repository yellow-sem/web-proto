var app = angular.module('app');

app.directive('messageList', function() {
    return {
        restrict: "E",
        replace: true,
        templateUrl: 'static/message-list/message-list.html',
        
        controller: function($scope) {
            $scope.messages = ["msg1", "msg2", "msg3"];
        }
    };
});