var app = angular.module('app');

app.directive('messageForm', function() {
    return {
        restrict: "E",
        replace: true,
        templateUrl: 'static/message-form/message-form.html',
        scope: {},

        controller: function($scope) {
            $scope.messageContent = '';
            $scope.sendMessage = function() {
                $scope.messageContent = 'Button pressed.'
            }
        }
    };
});