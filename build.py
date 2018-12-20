from jinja2 import Environment, FileSystemLoader #, select_autoescape
from subprocess import Popen, PIPE


env = Environment(
    loader=FileSystemLoader('templates'),
    # autoescape=select_autoescape(['html', 'xml'])
)

lineTable = {
    "fork": 2580,
    "forkret": 2853,
    "struct proc": 2337,
    "entry": 1044,
    "main": 1217,
}


def goto_line(ident):
    #{{"fork" | goto_line}}
    temp = '<code><a href="javascript:gotoLine(%d);">%s</a></code>'
    return temp % (lineTable[ident], ident)

def goto_lines(ident, start, end):
    #{{"fork" | goto_line }}
    temp = '<code><a href="javascript:gotoLines(%d, %d);">%s</a></code>'
    return temp % (start, end, ident)


def section(title):
    #{{"exercies" | section}}
    return '<h3>§ %s</h3>' % title

def chapter(title):
    #{{"exercies" | chapter }}
    return '<h1>%s</h1>' % title

def code(listing):
    # {{ ''' foo() \n bar() ''' | code }}
    # format this with external
    proc = Popen(["clang-format"], stdout=PIPE, stdin=PIPE)
    result = proc.communicate(input=bytearray(listing, 'utf-8'))

    if proc.returncode != 0:
        raise Exception("build.py fails to call clang-format for listing: " + listing)


    from pygments import highlight
    from pygments.lexers import CLexer
    from pygments.formatters import HtmlFormatter

    fmtd = highlight(result[0].decode(), CLexer(), HtmlFormatter())
    return "%s\n" % fmtd
    
    
    
    
    return listing

def line(lineNum):
    return '<a href="javascript:gotoLine(%d);">(%d)</a>' % (lineNum, lineNum)

def appendix(name):
    return '<a href="this will be a link">Appendix %s</a>' % name

def figure(caption, num):
    temp = '''
    <br/>
    <img src="figs/fig%s.jpg" alt="figure %s" class="img-thumbnail">
    <br>
    <br>
    <center>
      <b>Figure %s.</b>
      <small class="text-muted">%s</small>
    </center>
    <br><br>
    '''
    return temp % (num, num, num, caption)


def main():
    env.filters["goto_line"] = goto_line
    env.filters["goto_lines"] = goto_lines
    env.filters["section"] = section
    env.filters["chapter"] = chapter
    env.filters["code"] = code
    env.filters["line"] = line
    env.filters["appendix"] = appendix
    env.filters["figure"] = figure
    

    
    #template = env.get_template("test.html")
    template = env.get_template("index.html")
    print (template.render())    

main()    
