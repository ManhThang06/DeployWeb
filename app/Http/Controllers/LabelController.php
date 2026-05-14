<?php

namespace App\Http\Controllers;

use App\Models\Label;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LabelController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:50',
        ]);

        Auth::user()->labels()->create($validated);

        return back();
    }

    public function update(Request $request, Label $label)
    {
        if ($label->user_id !== Auth::id()) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:50',
        ]);

        $label->update($validated);

        return back();
    }

    public function destroy(Label $label)
    {
        if ($label->user_id !== Auth::id()) {
            abort(403);
        }

        $labelName = $label->name;
        // Lấy tất cả ghi chú đang gắn nhãn này
        $affectedNotes = $label->notes()->get();

        foreach ($affectedNotes as $note) {
            // Tìm tất cả người tham gia (chủ sở hữu + cộng tác viên)
            $participants = $note->sharedWith->pluck('id')->push($note->user_id)->unique();
            
            foreach ($participants as $userId) {
                // Tìm nhãn có cùng tên của người tham gia này
                $participantLabel = Label::where('user_id', $userId)
                                        ->where('name', $labelName)
                                        ->first();
                if ($participantLabel) {
                    // Gỡ nhãn khỏi ghi chú cụ thể này
                    $note->labels()->detach($participantLabel->id);
                }
            }
            
            // Phát sự kiện Real-time để cập nhật UI cho những người đang mở ghi chú
            broadcast(new \App\Events\NoteUpdated($note->load(['labels', 'images']), Auth::id()));
        }

        // Xóa nhãn gốc
        $label->delete();

        return back();
    }
}
