(defpackage :tjota.api
  (:use :common-lisp))

(require 'sb-bsd-sockets)
(defparameter *localhost-address* '(127 0 0 1))


(defun connect-to-chat ()
  (let ((socket (make-instance 'sb-bsd-sockets:inet-socket
			       :type :stream :protocol :tcp)))
    (sb-bsd-sockets:socket-connect socket *localhost-address* 8000)
    (sb-bsd-sockets:socket-receive socket nil 50)
    socket))


(defun login (l)
  (let* ((conn (sb-bsd-sockets:socket-send l
                                           (string "auth:login 1234 gusnogse@yellow cer9/PUP")
                                           nil 
                                           :external-format :utf-8)))
    (sb-bsd-sockets:socket-receive l
                                   nil
                                   80)))


(defun main ()
  (let* ((conn (connect-to-chat))
        (response (login conn)))
    (with-input-from-string (s response)
      (read-line s))))
