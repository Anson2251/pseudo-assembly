; This assembly code is based on the example on the 
; Cambridge International AS and A Levels Computer 
; Science Coursebook (Hodder Education) page 127
        LDM     #0              ; Load 0 into ACC
        STO     total           ; Store 0 in total
        STO     counter         ; Store 0 in counter
        LDR     #0              ; Set IX to 0

loop:   LDX     number          ; Load the number indexed by IX into ACC
        ADD     total           ; Add total to ACC
        STO     total           ; Store result in total
        INC     IX              ; Add 1 to the contents of IX
        LDD     counter         ; Load counter into ACC
        INC     ACC             ; Add 1 to ACC
        STO     counter         ; Store result in counter
        CMP     #3              ; Compare with 3
        JPN     loop            ; If ACC not equal to 3 then return to start of loop
        LDD     total           ; Load total into ACC
        OUT
        END                     ; End of program

number: #5                      ; List of three numbers
        #7
        #3
counter:
total: