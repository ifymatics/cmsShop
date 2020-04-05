$(() => {
    if ($('textarea#ta').length) {
        CKEDITOR.replace('ta');
        // ClassicEditor
        //     .create(document.querySelector('#ta'))
        //     .catch(error => {
        //         console.error(error);
        //     });
    }
});
$('a.confirmDeletion').on('click', () => {
    if (!confirm("Confirm Deletion"))
        return false
});
