let headerMenuController = headerMenu({ 
	block: $('#titleBlock')
});

function headerMenu({ block } = {}) {
    let buttons = {
        exit: block.find('#exitButton')
    };

    function exit() {
        const path = "/authorisation/exit";

        $.ajax({
            type: 'POST',
            url: path,
            asinc: true,
            success: function(answer) {
                if (answer.error) {
                    throw new Error(`POST ERROR: \n ${answer.error.message}`);
                } else {
                    location.reload();
                }
            }
        });
    }

    buttons.exit.on("click", exit);
}