(fset 'xv6-goto-line
      (lambda (&optional arg) "Keyboard macro."
        (interactive "p")
        (kmacro-exec-ring-item '("{{\"[1;5C\"|goto_oiline}}" 0 "%d") arg)))

(fset 'xv6-code
   (lambda (&optional arg) "Keyboard macro." (interactive "p") (kmacro-exec-ring-item '("<code></code>" 0 "%d") arg)))
