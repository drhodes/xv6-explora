(fset 'gotoLine (lambda (&optional arg) "Keyboard macro." (interactive "p") (kmacro-exec-ring-item '(" [1;5C<a href=\"javascript:gotoLine(?);\">()</a>" 0 "%d") arg)))


(fset 'gotoLines (lambda (&optional arg)
                   "Keyboard macro."
                   (interactive "p")
                   (kmacro-exec-ring-item '(" [1;5C<a href=\"javascript:gotoLines(?);\">()</a>" 0 "%d") arg)))
