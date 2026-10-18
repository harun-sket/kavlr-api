#!/data/data/com.termux/files/usr/bin/bash

CMD="$1"
shift
ARGS="$@"
FULL_CMD="$CMD $ARGS"

# Define which commands should be intercepted
DANGEROUS_CMDS=("rm" "cat" "curl" "wget" "sudo" "chmod" "mv" "cp")

if [[ " ${DANGEROUS_CMDS[@]} " =~ " ${CMD} " ]]; then
  # Run KAVLR CLI
  ~/kavlr/kavlr-cli.js "$CMD" $ARGS
  
  # If KAVLR fails or blocks (exit code != 0), STOP the original command
  if [ $? -ne 0 ]; then
    echo "🛑 [KAVLR HOOK] Execution blocked by security policy."
    exit 1
  fi
fi

# If allowed, run the actual command
command "$CMD" "$@"
