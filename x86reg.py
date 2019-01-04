

regTable = {
    "cr0": '''%cr0 contains system control flags, which control or indicate
    conditions that apply to the system as a whole, not to an individual
    task.''',

    "cr2": '''%cr2 is used for handling page faults when PG is set. The processor
    stores in %CR2 the linear address that triggers the fault . Refer to
    Chapter 9 for a description of page-fault handling.''',
    
    "cr3": '''%cr3 is used when PG is set. CR3 enables the processor to locate
    the page table directory for the current task . Refer to Chapter 5 for
    a description of page tables and page translation.''',

    # from https://pdos.csail.mit.edu/6.828/2018/readings/i386/s02_03.htm
    "esp": '''The stack pointer (ESP) register. ESP points to the top of the
    push-down stack (TOS). It is referenced implicitly by PUSH and POP
    operations, subroutine calls and returns, and interrupt
    operations. When an item is pushed onto the stack,
    the processor decrements ESP, then writes the item at the new
    TOS. When an item is popped off the stack, the processor copies it
    from TOS, then increments ESP. In other words, the stack grows down in
    memory toward lesser addresses.''',

    "ss": '''The stack segment (SS) register. Stacks are implemented in
    memory. A system may have a number of stacks that is limited only by
    the maximum number of segments. A stack may be up to 4 gigabytes long,
    the maximum length of a segment. One stack is directly addressable at
    a -- one located by SS. This is the current stack, often referred to
    simply as 'the' stack. SS is used automatically by the processor for
    all stack operations.''',

    "ebp": '''The stack-frame base pointer (EBP) register. The EBP is the best
    choice of register for accessing data structures, variables and
    dynamically allocated work space within the stack. EBP is often used
    to access elements on the stack relative to a fixed point on the stack
    rather than relative to the current TOS. It typically identifies the
    base address of the current stack frame established for the current
    procedure. When EBP is used as the base register in an offset
    calculation, the offset is calculated automatically in the current
    stack segment (i.e., the segment currently selected by SS). Because SS
    does not have to be explicitly specified, instruction encoding in such
    cases is more efficient. EBP can also be used to index into segments
    addressable via other segment registers.''',

    "eflags": '''The status flags of the EFLAGS register allow the results of one
    instruction to influence later instructions. The arithmetic
    instructions use OF, SF, ZF, AF, PF, and CF. The SCAS (Scan String),
    CMPS (Compare String), and LOOP instructions use ZF to signal that
    their operations are complete. There are instructions to set, clear,
    and complement CF before execution of an arithmetic instruction. Refer
    to Appendix C for definition of each status flag.''',
}

REG_TEMPLATE=''' <a class="popoverOption" data-content="%s" rel="popover"><code>%s</code></a> '''
