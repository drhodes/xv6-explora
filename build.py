from jinja2 import Environment, FileSystemLoader #, select_autoescape

env = Environment(
    loader=FileSystemLoader('templates'),
    # autoescape=select_autoescape(['html', 'xml'])
)

lineTable = {
    "fork": 2580,
    "forkret": 2853,
}


def goto_line(ident):
    #{{"fork" | goto_line}}
    temp = '<code><a href="javascript:gotoLine(%d);">%s</a></code>'
    return temp % (lineTable[ident], ident)


def main():
    env.filters["goto_line"] = goto_line
    #template = env.get_template("test.html")
    template = env.get_template("index.html")
    print (template.render())    

main()    
